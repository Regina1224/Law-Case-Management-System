using LawFirm.Application.DTOs.Intakes;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Repositories.Interfaces;
using LawFirm.Infrastructure.Storage;
using Microsoft.AspNetCore.Http;

namespace LawFirm.Application.Services;

public class DocumentService : IDocumentService
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IIntakeRepository _intakeRepository;
    private readonly IBlobStorageService _blobStorageService;

    private const string ContainerName = "legal-documents";
    private const long MaxFileSizeBytes = 20 * 1024 * 1024;
    private static readonly string[] AllowedContentTypes =
    [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    public DocumentService(
        IDocumentRepository documentRepository,
        IIntakeRepository intakeRepository,
        IBlobStorageService blobStorageService)
    {
        _documentRepository = documentRepository;
        _intakeRepository = intakeRepository;
        _blobStorageService = blobStorageService;
    }

    public async Task<IntakeDocumentDto> UploadIntakeDocumentAsync(
        int intakeId, IFormFile file, string documentCategory, string? description)
    {
        var intake = await _intakeRepository.GetByIdAsync(intakeId);
        if (intake == null)
        {
            throw new KeyNotFoundException($"Intake with id {intakeId} was not found.");
        }

        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is required.");
        }

        if (string.IsNullOrWhiteSpace(documentCategory))
        {
            throw new ArgumentException("Document category is required.");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new ArgumentException("File size exceeds the 20MB limit.");
        }

        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            throw new ArgumentException($"File type '{file.ContentType}' is not allowed.");
        }

        var now = DateTime.UtcNow;
        var safeFileName = $"{Guid.NewGuid()}-{Path.GetFileName(file.FileName)}";
        var blobPath = $"intakes/{intakeId}/{now:yyyy}/{now:MM}/{safeFileName}";

        using (var stream = file.OpenReadStream())
        {
            await _blobStorageService.UploadFileAsync(ContainerName, blobPath, stream, file.ContentType);
        }

        var document = new Document
        {
            IntakeId = intakeId,
            FileName = safeFileName,
            OriginalFileName = file.FileName,
            DocumentCategory = documentCategory,
            BlobPath = blobPath,
            FileSizeBytes = file.Length,
            ContentType = file.ContentType,
            Description = description,
            UploadedAt = now
        };

        var savedDocument = await _documentRepository.AddAsync(document);

        return new IntakeDocumentDto
        {
            DocumentId = savedDocument.DocumentId,
            OriginalFileName = savedDocument.OriginalFileName,
            DocumentCategory = savedDocument.DocumentCategory,
            Description = savedDocument.Description,
            FileSizeBytes = savedDocument.FileSizeBytes,
            ContentType = savedDocument.ContentType,
            UploadedAt = savedDocument.UploadedAt
        };
    }

    public async Task<List<IntakeDocumentDto>> GetIntakeDocumentsAsync(int intakeId)
    {
        var documents = await _documentRepository.GetByIntakeIdAsync(intakeId);

        return documents.Select(d => new IntakeDocumentDto
        {
            DocumentId = d.DocumentId,
            OriginalFileName = d.OriginalFileName,
            DocumentCategory = d.DocumentCategory,
            Description = d.Description,
            FileSizeBytes = d.FileSizeBytes,
            ContentType = d.ContentType,
            UploadedAt = d.UploadedAt
        }).ToList();
    }

    public async Task<(Stream FileStream, string ContentType, string FileName)> DownloadIntakeDocumentAsync(int documentId)
    {
        var document = await _documentRepository.GetByIdAsync(documentId);
        if (document == null)
        {
            throw new KeyNotFoundException($"Document with id {documentId} was not found.");
        }

        var stream = await _blobStorageService.DownloadFileAsync(ContainerName, document.BlobPath);
        return (stream, document.ContentType, document.OriginalFileName);
    }
}