using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IMatterTaskRepository
{
    Task<List<MatterTask>> GetFilteredAsync(
        int matterId, string? status, string? assignedTo, string? priority);
    Task<MatterTask> AddAsync(MatterTask task);
}