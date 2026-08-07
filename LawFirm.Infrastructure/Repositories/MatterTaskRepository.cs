using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

public class MatterTaskRepository : IMatterTaskRepository
{
    private readonly LawFirmDbContext _dbContext;

    public MatterTaskRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<MatterTask>> GetFilteredAsync(
        int matterId, string? status, string? assignedTo, string? priority)
    {
        IQueryable<MatterTask> query = _dbContext.MatterTasks
            .Where(t => t.MatterId == matterId)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status == status);
        }

        if (!string.IsNullOrEmpty(assignedTo))
        {
            query = query.Where(t => t.AssignedTo == assignedTo);
        }

        if (!string.IsNullOrEmpty(priority))
        {
            query = query.Where(t => t.Priority == priority);
        }

        return await query.OrderBy(t => t.DueDate).ToListAsync();
    }

    public async Task<MatterTask> AddAsync(MatterTask task)
    {
        _dbContext.MatterTasks.Add(task);
        await _dbContext.SaveChangesAsync();
        return task;
    }
}