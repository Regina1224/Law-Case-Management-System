namespace LawFirm.Application.DTOs.Matters;

public class CreateMatterRelatedPartyDto
{
    public string PartyName { get; set; } = string.Empty;
    public string PartyType { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Organization { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
}