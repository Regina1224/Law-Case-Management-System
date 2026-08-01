using System;

namespace LawFirm.Domain.Entities;

public class ClientContact
    {
        public int ClientContactId { get; set; }
        public int ClientId { get; set; }  // Foreign key, pointing to the Clients table

        public string ContactName { get; set; } = string.Empty;
        public string RelationshipType { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? Notes { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }

        // Navigation property: points to the Client it belongs to.
        public Client Client { get; set; } = null!;
    }
