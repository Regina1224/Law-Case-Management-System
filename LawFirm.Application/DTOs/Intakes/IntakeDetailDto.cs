namespace LawFirm.Application.DTOs.Intakes;

public class IntakeDetailDto
{
    public int IntakeId { get; set; }
    public string IntakeCode { get; set; } = string.Empty;
    public string ProspectiveClientName { get; set; } = string.Empty;
    public string? IntendedClientType { get; set; }
    public string? PrimaryEmail { get; set; }
    public string? PrimaryPhone { get; set; }
    public int PracticeAreaId { get; set; }
    public string PracticeAreaName { get; set; } = string.Empty;
    public string LegalIssueSummary { get; set; } = string.Empty;
    public string? Urgency { get; set; }
    public string? AssignedReviewer { get; set; }
    public string? SourceOfEnquiry { get; set; }
    public DateTime? ConsultationDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}