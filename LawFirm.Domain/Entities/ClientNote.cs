using System;

namespace LawFirm.Domain.Entities;

public class ClientNote
    {
        public int ClientNoteId { get; set; }
        public int ClientId { get; set; }

        public string NoteTitle { get; set; } = string.Empty;
        public string NoteContent { get; set; } = string.Empty;
        public string? NoteType { get; set; }

        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }

        public Client Client { get; set; } = null!;
    }
