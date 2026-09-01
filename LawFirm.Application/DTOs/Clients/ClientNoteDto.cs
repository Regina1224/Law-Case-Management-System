namespace LawFirm.Application.DTOs.Clients;

    public class ClientNoteDto
    {
        public int ClientNoteId { get; set; }
        public int ClientId { get; set; }
        public string NoteTitle { get; set; } = string.Empty;
        public string NoteContent { get; set; } = string.Empty;
        public string? NoteType { get; set; }
        public DateTime CreatedAt { get; set; }
    }
