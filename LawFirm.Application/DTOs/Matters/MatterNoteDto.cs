namespace LawFirm.Application.DTOs.Matters;

public class MatterNoteDto
{
    public int MatterNoteId { get; set; }
    public int MatterId { get; set; }
    public string NoteTitle { get; set; } = string.Empty;
    public string NoteContent { get; set; } = string.Empty;
    public string? NoteType { get; set; }
    public DateTime CreatedAt { get; set; }
}