namespace LawFirm.Application.DTOs.Clients;

    public class CreateClientNoteDto
    {
        public string NoteTitle { get; set; } = string.Empty;
        public string NoteContent { get; set; } = string.Empty;
        public string? NoteType { get; set; }
    }