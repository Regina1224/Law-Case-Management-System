namespace LawFirm.Application.DTOs.Matters;

public class UpdateMatterDto
{
    public string ResponsibleLawyer { get; set; } = string.Empty;
    public string? SupportingStaff { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Priority { get; set; }
    public DateTime? TargetCloseDate { get; set; }
}