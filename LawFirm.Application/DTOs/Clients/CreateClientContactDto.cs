using System;

namespace LawFirm.Application.DTOs.Clients;

 public class CreateClientContactDto
    {
        public string ContactName { get; set; } = string.Empty;
        public string RelationshipType { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? Notes { get; set; }
    }