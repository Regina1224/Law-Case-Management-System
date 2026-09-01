namespace LawFirm.Domain.Entities
{
    public class Client
    {
        public int ClientId { get; set; }
        public string ClientCode { get; set; } = string.Empty;
        public string ClientType { get; set; } = string.Empty; // "Individual" or "Corporate"
        public string Status { get; set; } = string.Empty;

        // Individual
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PreferredName { get; set; }
        public DateOnly? DateOfBirth { get; set; }

        // Corporate
        public string? OrganizationName { get; set; }
        public string? TradingName { get; set; }
        public string? AbnAcn { get; set; }

        // General Contact Information
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Postcode { get; set; }
        public string? Country { get; set; }
        public string? InternalNotesSummary { get; set; }

        public bool IsArchived { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }

        public ICollection<ClientContact> ClientContacts { get; set; } = new List<ClientContact>();

        public ICollection<ClientNote> ClientNotes { get; set; } = new List<ClientNote>();
    }
}