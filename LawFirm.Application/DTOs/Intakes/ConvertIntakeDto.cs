namespace LawFirm.Application.DTOs.Intakes;

public class ConvertIntakeDto
{
    // If set, the Matter is linked to this existing Client and no new Client is created.
    // If null, a new Client is created from the fields below.
    public int? ExistingClientId { get; set; }

    // New client fields (required when ExistingClientId is null)
    public string? ClientType { get; set; } // "Individual" or "Corporate"
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? OrganizationName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }

    // Matter fields not already available on the Intake
    public string MatterTitle { get; set; } = string.Empty;
    public int MatterTypeId { get; set; }
    public string ResponsibleLawyer { get; set; } = string.Empty;
    public string? SupportingStaff { get; set; }
    public string Status { get; set; } = "Draft";
    public string? Priority { get; set; }
    public DateTime OpenedDate { get; set; } = DateTime.UtcNow;
    public DateTime? TargetCloseDate { get; set; }
    public bool IsConfidential { get; set; }
}