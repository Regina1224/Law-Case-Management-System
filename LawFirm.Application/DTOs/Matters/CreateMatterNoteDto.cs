namespace LawFirm.Application.DTOs.Matters;

public class CreateMatterNoteDto
{
    public string NoteTitle { get; set; } = string.Empty;
    public string NoteContent { get; set; } = string.Empty;
    public string? NoteType { get; set; }
}