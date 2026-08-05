namespace LawFirm.Application.DTOs.Matters;

public class CreateMatterDto
{
    public int ClientId { get; set; }
    public string MatterTitle { get; set; } = string.Empty;
    public int MatterTypeId { get; set; }
    public int PracticeAreaId { get; set; }
    public string ResponsibleLawyer { get; set; } = string.Empty;
    public string? SupportingStaff { get; set; }
    public string Status { get; set; } = "Draft";
    public string? Priority { get; set; }
    public string Summary { get; set; } = string.Empty;
    public DateTime OpenedDate { get; set; } = DateTime.UtcNow;
    public DateTime? TargetCloseDate { get; set; }
    public bool IsConfidential { get; set; }
}