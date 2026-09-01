namespace LawFirm.Domain.Entities;

public class Document
{
    public int DocumentId { get; set; }

    public int? ClientId { get; set; }
    public int? MatterId { get; set; }
    public int? IntakeId { get; set; }
    public Intake? Intake { get; set; }

    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;

    // After REF-01 completes the Document Categories reference table, the foreign keys will be reconstructed.
    public string DocumentCategory { get; set; } = string.Empty;

    public string BlobPath { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string? Description { get; set; }

    public string? UploadedBy { get; set; }
    public DateTime UploadedAt { get; set; }
    public bool IsArchived { get; set; }
}