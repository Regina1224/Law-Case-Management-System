using System;

namespace LawFirm.Application.DTOs.Clients;

public class UpdateClientDto
    {
        public string Status { get; set; } = string.Empty;

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PreferredName { get; set; }
        public DateOnly? DateOfBirth { get; set; }

        public string? OrganizationName { get; set; }
        public string? TradingName { get; set; }
        public string? AbnAcn { get; set; }

        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Postcode { get; set; }
        public string? Country { get; set; }
        public string? InternalNotesSummary { get; set; }
    }
