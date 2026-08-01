using System;

namespace LawFirm.Application.DTOs.Clients;

public class ClientContactDto
    {
        public int ClientContactId { get; set; }
        public int ClientId { get; set; }
        public string ContactName { get; set; } = string.Empty;
        public string RelationshipType { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }


