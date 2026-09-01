using LawFirm.Application.DTOs.Clients;
using LawFirm.Application.DTOs.Intakes;
using LawFirm.Application.DTOs.Matters;
using Microsoft.AspNetCore.Http;
namespace LawFirm.Application.Services.Interfaces;

public interface IDocumentService
{
    Task<IntakeDocumentDto> UploadIntakeDocumentAsync(int intakeId, IFormFile file, string documentCategory, string? description);
    Task<List<IntakeDocumentDto>> GetIntakeDocumentsAsync(int intakeId);
    Task<(Stream FileStream, string ContentType, string FileName)> DownloadDocumentAsync(int documentId);

    Task<List<MatterDocumentDto>> GetMatterDocumentsAsync(int matterId);

    Task<MatterDocumentDto> UploadMatterDocumentAsync(int matterId, IFormFile file, string documentCategory, string? description);

    Task<List<ClientDocumentDto>> GetClientDocumentsAsync(int clientId);

    Task<ClientDocumentDto> UploadClientDocumentAsync(int clientId, IFormFile file, string documentCategory, string? description);
}