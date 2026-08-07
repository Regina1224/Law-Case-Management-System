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

    public async Task<MatterDeadline> AddAsync(MatterDeadline deadline)
    {
        _dbContext.MatterDeadlines.Add(deadline);
        await _dbContext.SaveChangesAsync();
        return deadline;
    }
}