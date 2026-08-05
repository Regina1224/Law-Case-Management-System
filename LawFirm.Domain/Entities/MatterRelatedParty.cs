namespace LawFirm.Domain.Entities;

public class MatterRelatedParty
{
    public int MatterRelatedPartyId { get; set; }
    public int MatterId { get; set; }

    public string PartyName { get; set; } = string.Empty;
    public string PartyType { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Organization { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    public Matter Matter { get; set; } = null!;
}