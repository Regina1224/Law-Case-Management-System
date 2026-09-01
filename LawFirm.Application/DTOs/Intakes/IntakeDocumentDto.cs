namespace LawFirm.Application.DTOs.Intakes;

public class IntakeDocumentDto
{
    public int DocumentId { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string DocumentCategory { get; set; } = string.Empty;
    public string? Description { get; set; }
    public long FileSizeBytes { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}