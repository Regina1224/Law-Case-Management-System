using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

public class MatterDeadlineRepository : IMatterDeadlineRepository
{
    private readonly LawFirmDbContext _dbContext;

    public MatterDeadlineRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<MatterDeadline>> GetByMatterIdAsync(int matterId)
    {
        return await _dbContext.MatterDeadlines
            .Where(d => d.MatterId == matterId)
            .OrderBy(d => d.DueDateTime)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<MatterDeadline?> GetByIdAsync(int id)
    {
        return await _dbContext.MatterDeadlines.FindAsync(id);
    }

    public async Task<MatterDeadline> AddAsync(MatterDeadline deadline)
    {
        _dbContext.MatterDeadlines.Add(deadline);
        await _dbContext.SaveChangesAsync();
        return deadline;
    }

    public async Task<MatterDeadline> UpdateAsync(MatterDeadline deadline)
    {
        _dbContext.MatterDeadlines.Update(deadline);
        await _dbContext.SaveChangesAsync();
        return deadline;
    }
}