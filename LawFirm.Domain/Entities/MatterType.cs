namespace LawFirm.Domain.Entities;

public class MatterType
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Code { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}