namespace LawFirm.Application.DTOs.Intakes;

public class UpdateIntakeDto
{
    public string Status { get; set; } = string.Empty;
    public string? AssignedReviewer { get; set; }
    public int PracticeAreaId { get; set; }
    public string? Urgency { get; set; }
    public DateTime? ConsultationDate { get; set; }
    public string LegalIssueSummary { get; set; } = string.Empty;
}