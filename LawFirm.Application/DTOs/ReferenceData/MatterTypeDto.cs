namespace LawFirm.Application.DTOs.ReferenceData;

public class MatterTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}