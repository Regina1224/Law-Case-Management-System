namespace LawFirm.Application.DTOs.Matters;

public class CloseMatterDto
{
    public DateTime ClosureDate { get; set; }
    public string ClosureReason { get; set; } = string.Empty;
    public string? ClosureNotes { get; set; }
}