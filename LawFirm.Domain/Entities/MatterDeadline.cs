namespace LawFirm.Domain.Entities;

public class MatterDeadline
{
    public int MatterDeadlineId { get; set; }
    public int MatterId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string DeadlineType { get; set; } = string.Empty;
    public DateTime DueDateTime { get; set; }
    public string? ResponsiblePerson { get; set; }
    public string? LocationOrCourt { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Scheduled";

    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    public Matter Matter { get; set; } = null!;
}