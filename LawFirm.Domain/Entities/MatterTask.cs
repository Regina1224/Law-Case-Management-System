namespace LawFirm.Domain.Entities;

public class MatterTask
{
    public int MatterTaskId { get; set; }
    public int MatterId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AssignedTo { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = "Not Started";
    public DateTime DueDate { get; set; }
    public DateTime? CompletedDate { get; set; }

    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    public Matter Matter { get; set; } = null!;
}