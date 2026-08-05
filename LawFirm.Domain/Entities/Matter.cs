namespace LawFirm.Domain.Entities;

public class Matter
{
    public int MatterId { get; set; }
    public string MatterNumber { get; set; } = string.Empty;

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public string MatterTitle { get; set; } = string.Empty;

    public int MatterTypeId { get; set; }
    public MatterType MatterType { get; set; } = null!;

    public int PracticeAreaId { get; set; }
    public PracticeArea PracticeArea { get; set; } = null!;

    public string? ResponsibleLawyer { get; set; }  // string 
    public string? SupportingStaff { get; set; }     // same

    public string Status { get; set; } = "Draft";
    public string? Priority { get; set; }
    public string Summary { get; set; } = string.Empty;

    public DateTime OpenedDate { get; set; }
    public DateTime? TargetCloseDate { get; set; }
    public DateTime? ClosedDate { get; set; }

    public bool IsConfidential { get; set; }

    public int? SourceIntakeId { get; set; }
    public Intake? SourceIntake { get; set; }

    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    public ICollection<MatterNote> MatterNotes { get; set; } = new List<MatterNote>();
}