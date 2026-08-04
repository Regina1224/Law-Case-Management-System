namespace LawFirm.Application.DTOs.Intakes;

public class CreateIntakeDto
{
    public string ProspectiveClientName { get; set; } = string.Empty;
    public string? IntendedClientType { get; set; }
    public string? PrimaryEmail { get; set; }
    public string? PrimaryPhone { get; set; }
    public int PracticeAreaId { get; set; }
    public string LegalIssueSummary { get; set; } = string.Empty;
    public string? Urgency { get; set; }
    public string? AssignedReviewer { get; set; }
    public string? SourceOfEnquiry { get; set; }
    public DateTime? ConsultationDate { get; set; }
}