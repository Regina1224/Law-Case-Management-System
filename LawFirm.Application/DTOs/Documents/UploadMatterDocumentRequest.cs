using Microsoft.AspNetCore.Http;

namespace LawFirm.Application.DTOs.Documents;

public class UploadMatterDocumentRequest
{
    public IFormFile File { get; set; } = null!;
    public string DocumentCategory { get; set; } = string.Empty;
    public string? Description { get; set; }
}