using LawFirm.Application.DTOs.Intakes;
using LawFirm.Infrastructure.Repositories.Interfaces;
using LawFirm.Shared.Models;

namespace LawFirm.Application.Services
{
    public class IntakeService : IIntakeService
    {
        private readonly IIntakeRepository _intakeRepository;

        public IntakeService(IIntakeRepository intakeRepository)
        {
            _intakeRepository = intakeRepository;
        }

        public async Task<PagedResultDto<IntakeListItemDto>> GetIntakesAsync(
            string? keyword, string? status, int? practiceAreaId, string? assignedReviewer, int page, int pageSize)
        {
            var (items, totalCount) = await _intakeRepository.GetFilteredAsync(
                keyword, status, practiceAreaId, assignedReviewer, page, pageSize);

            var dtoItems = items.Select(i => new IntakeListItemDto
            {
                IntakeId = i.IntakeId,
                IntakeCode = i.IntakeCode,
                ProspectiveClientName = i.ProspectiveClientName,
                PracticeAreaName = i.PracticeArea.Name,
                AssignedReviewer = i.AssignedReviewer,
                Status = i.Status,
                Urgency = i.Urgency,
                CreatedAt = i.CreatedAt
            }).ToList();

            return new PagedResultDto<IntakeListItemDto>
            {
                Items = dtoItems,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }

    public interface IIntakeService
    {
        Task<PagedResultDto<IntakeListItemDto>> GetIntakesAsync(string? keyword, string? status, int? practiceAreaId, string? assignedReviewer, int page, int pageSize);
    }
}