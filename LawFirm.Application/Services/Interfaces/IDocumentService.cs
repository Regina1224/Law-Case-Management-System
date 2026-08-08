using LawFirm.Application.DTOs.Intakes;
using LawFirm.Application.DTOs.Matters;
using Microsoft.AspNetCore.Http;
namespace LawFirm.Application.Services.Interfaces;

public interface IDocumentService
{
    Task<IntakeDocumentDto> UploadIntakeDocumentAsync(int intakeId, IFormFile file, string documentCategory, string? description);
    Task<List<IntakeDocumentDto>> GetIntakeDocumentsAsync(int intakeId);
    Task<(Stream FileStream, string ContentType, string FileName)> DownloadIntakeDocumentAsync(int documentId);

    Task<List<MatterDocumentDto>> GetMatterDocumentsAsync(int matterId);
}