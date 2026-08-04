using Microsoft.AspNetCore.Http;

namespace LawFirm.Application.DTOs.Documents;

public class UploadIntakeDocumentRequest
{
    public IFormFile File { get; set; } = null!;
    public string DocumentCategory { get; set; } = string.Empty;
    public string? Description { get; set; }
}