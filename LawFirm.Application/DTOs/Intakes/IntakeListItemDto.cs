namespace LawFirm.Application.DTOs.Intakes
{
    public class IntakeListItemDto
    {
        public int IntakeId { get; set; }
        public string IntakeCode { get; set; } = string.Empty;
        public string ProspectiveClientName { get; set; } = string.Empty;
        public string PracticeAreaName { get; set; } = string.Empty;  // Not PracticeAreaId
        public string? AssignedReviewer { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Urgency { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}