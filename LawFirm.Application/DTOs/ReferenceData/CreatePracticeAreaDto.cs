using System;

namespace LawFirm.Application.DTOs.ReferenceData;

public class CreatePracticeAreaDto
{
    public required string Name { get; set; }
    public string? Code { get; set; }
    public int DisplayOrder { get; set; }

}
