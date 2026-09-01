namespace LawFirm.Application.DTOs.Matters;

public class CreateMatterTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AssignedTo { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
}