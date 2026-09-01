using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IMatterTaskRepository
{
    Task<List<MatterTask>> GetFilteredAsync(
        int matterId, string? status, string? assignedTo, string? priority);
    Task<MatterTask?> GetByIdAsync(int id);
    Task<MatterTask> AddAsync(MatterTask task);
    Task<MatterTask> UpdateAsync(MatterTask task);
}