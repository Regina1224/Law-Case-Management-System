using LawFirm.Application.DTOs.Intakes;
namespace LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;

public interface IItakeService
{
    Task<PagedResultDto<IntakeListItemDto>> GetIntakesAsync(
    string? keyword, string? status, int? practiceAreaId, string? assignedReviewer, int page, int pageSize);

}
