namespace LawFirm.Domain.Entities;

public class MatterNote
{
    public int MatterNoteId { get; set; }
    public int MatterId { get; set; }

    public string NoteTitle { get; set; } = string.Empty;
    public string NoteContent { get; set; } = string.Empty;
    public string? NoteType { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Matter Matter { get; set; } = null!;
}