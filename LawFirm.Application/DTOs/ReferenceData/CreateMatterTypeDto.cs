namespace LawFirm.Application.DTOs.ReferenceData;

public class CreateMatterTypeDto
{
    public required string Name { get; set; }
    public string? Code { get; set; }
    public int DisplayOrder { get; set; }
}