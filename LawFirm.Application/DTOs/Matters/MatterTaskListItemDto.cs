namespace LawFirm.Application.DTOs.Matters;

public class MatterTaskListItemDto
{
    public int MatterTaskId { get; set; }
    public int MatterId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}