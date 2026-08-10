using Azure;
using LawFirm.Application.DTOs.Clients;
using LawFirm.Application.DTOs.Intakes;
using LawFirm.Application.DTOs.Matters;
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
    private readonly IMatterRepository _matterRepository;
    private readonly IClientRepository _clientRepository;
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
        IMatterRepository matterRepository,
        IClientRepository clientRepository,
        IBlobStorageService blobStorageService)
    {
        _documentRepository = documentRepository;
        _intakeRepository = intakeRepository;
        _matterRepository = matterRepository;
        _clientRepository = clientRepository;
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

    public async Task<(Stream FileStream, string ContentType, string FileName)> DownloadDocumentAsync(int documentId)
    {
        var document = await _documentRepository.GetByIdAsync(documentId);
        if (document == null)
        {
            throw new KeyNotFoundException($"Document with id {documentId} was not found.");
        }

        Stream stream;
        try
        {
            stream = await _blobStorageService.DownloadFileAsync(ContainerName, document.BlobPath);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            throw new KeyNotFoundException($"The file for document with id {documentId} could not be found in storage.");
        }

        return (stream, document.ContentType, document.OriginalFileName);
    }

    public async Task<List<MatterDocumentDto>> GetMatterDocumentsAsync(int matterId)
    {
        var documents = await _documentRepository.GetByMatterIdAsync(matterId);

        return documents.Select(d => new MatterDocumentDto
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

    public async Task<MatterDocumentDto> UploadMatterDocumentAsync(
        int matterId, IFormFile file, string documentCategory, string? description)
    {
        var matter = await _matterRepository.GetByIdAsync(matterId);
        if (matter == null)
        {
            throw new KeyNotFoundException($"Matter with id {matterId} was not found.");
        }

        if (matter.Status == "Closed")
        {
            throw new ArgumentException("This matter is closed and cannot be modified.");
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
        var blobPath = $"matters/{matterId}/{now:yyyy}/{now:MM}/{safeFileName}";

        using (var stream = file.OpenReadStream())
        {
            await _blobStorageService.UploadFileAsync(ContainerName, blobPath, stream, file.ContentType);
        }

        var document = new Document
        {
            MatterId = matterId,
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

        return new MatterDocumentDto
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

    public async Task<List<ClientDocumentDto>> GetClientDocumentsAsync(int clientId)
    {
        var documents = await _documentRepository.GetByClientIdAsync(clientId);

        return documents.Select(d => new ClientDocumentDto
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

    public async Task<ClientDocumentDto> UploadClientDocumentAsync(
        int clientId, IFormFile file, string documentCategory, string? description)
    {
        var client = await _clientRepository.GetByIdAsync(clientId);
        if (client == null)
        {
            throw new KeyNotFoundException($"Client with id {clientId} was not found.");
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
        var blobPath = $"clients/{clientId}/{now:yyyy}/{now:MM}/{safeFileName}";

        using (var stream = file.OpenReadStream())
        {
            await _blobStorageService.UploadFileAsync(ContainerName, blobPath, stream, file.ContentType);
        }

        var document = new Document
        {
            ClientId = clientId,
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

        return new ClientDocumentDto
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
}