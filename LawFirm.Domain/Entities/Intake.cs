namespace LawFirm.Domain.Entities;

    public class Intake
    {
        public int IntakeId { get; set; }
        public string IntakeCode { get; set; } = string.Empty;

        public string ProspectiveClientName { get; set; } = string.Empty;
        public string? IntendedClientType { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }

        public int PracticeAreaId { get; set; }  // Foreign key, related to the existing PracticeArea table
        public PracticeArea PracticeArea { get; set; } = null!;

        public string LegalIssueSummary { get; set; } = string.Empty;
        public string? Urgency { get; set; }
        public string? AssignedReviewer { get; set; }  // Temporarily store text without creating foreign keys.
        public string? SourceOfEnquiry { get; set; }
        public string? OpposingPartySummary { get; set; }
        public string Status { get; set; } = "New";
        public DateTime? ConsultationDate { get; set; }

        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
    }
