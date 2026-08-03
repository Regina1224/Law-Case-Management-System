using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces
{
    public interface IIntakeRepository
    {
        Task<(List<Intake> Items, int TotalCount)> GetFilteredAsync(
            string? keyword, string? status, int? practiceAreaId, string? assignedReviewer,
            int page, int pageSize);
        Task<Intake?> GetByIdAsync(int id);
        Task<Intake> AddAsync(Intake intake);
        Task<int> GetIntakeCountAsync();
    }
}