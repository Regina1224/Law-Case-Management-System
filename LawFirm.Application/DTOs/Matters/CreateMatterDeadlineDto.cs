namespace LawFirm.Application.DTOs.Matters;

public class CreateMatterDeadlineDto
{
    public string Title { get; set; } = string.Empty;
    public string DeadlineType { get; set; } = string.Empty;
    public DateTime DueDateTime { get; set; }
    public string ResponsiblePerson { get; set; } = string.Empty;
    public string? LocationOrCourt { get; set; }
    public string? Notes { get; set; }
}