namespace LawFirm.Application.DTOs.Matters;

public class MatterListItemDto
{
    public int MatterId { get; set; }
    public string MatterNumber { get; set; } = string.Empty;
    public string MatterTitle { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string MatterTypeName { get; set; } = string.Empty;
    public string PracticeAreaName { get; set; } = string.Empty;
    public string? ResponsibleLawyer { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Priority { get; set; }
    public DateTime OpenedDate { get; set; }
}