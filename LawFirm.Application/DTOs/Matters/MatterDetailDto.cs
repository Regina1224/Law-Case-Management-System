namespace LawFirm.Application.DTOs.Matters;

public class MatterDetailDto
{
    public int MatterId { get; set; }
    public string MatterNumber { get; set; } = string.Empty;
    public string MatterTitle { get; set; } = string.Empty;

    public int ClientId { get; set; }
    public string ClientCode { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;

    public int MatterTypeId { get; set; }
    public string MatterTypeName { get; set; } = string.Empty;

    public int PracticeAreaId { get; set; }
    public string PracticeAreaName { get; set; } = string.Empty;

    public string? ResponsibleLawyer { get; set; }
    public string? SupportingStaff { get; set; }

    public string Status { get; set; } = string.Empty;
    public string? Priority { get; set; }
    public string Summary { get; set; } = string.Empty;

    public DateTime OpenedDate { get; set; }
    public DateTime? TargetCloseDate { get; set; }
    public DateTime? ClosedDate { get; set; }

    public bool IsConfidential { get; set; }

    public DateTime CreatedAt { get; set; }
}