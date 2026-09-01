namespace LawFirm.Application.DTOs.Matters;

public class MatterDeadlineListItemDto
{
    public int MatterDeadlineId { get; set; }
    public int MatterId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string DeadlineType { get; set; } = string.Empty;
    public DateTime DueDateTime { get; set; }
    public string? ResponsiblePerson { get; set; }
    public string? LocationOrCourt { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
}