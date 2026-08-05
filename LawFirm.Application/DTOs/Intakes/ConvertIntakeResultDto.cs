namespace LawFirm.Application.DTOs.Intakes;

public class ConvertIntakeResultDto
{
    public int IntakeId { get; set; }
    public string IntakeCode { get; set; } = string.Empty;
    public string IntakeStatus { get; set; } = string.Empty;

    public int ClientId { get; set; }
    public string ClientCode { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;

    public int MatterId { get; set; }
    public string MatterNumber { get; set; } = string.Empty;
    public string MatterTitle { get; set; } = string.Empty;
}