using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

public class MatterRelatedPartyRepository : IMatterRelatedPartyRepository
{
    private readonly LawFirmDbContext _dbContext;

    public MatterRelatedPartyRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<MatterRelatedParty>> GetByMatterIdAsync(int matterId)
    {
        return await _dbContext.MatterRelatedParties
            .Where(p => p.MatterId == matterId && p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<MatterRelatedParty?> GetByIdAsync(int id)
    {
        return await _dbContext.MatterRelatedParties.FindAsync(id);
    }

    public async Task<MatterRelatedParty> AddAsync(MatterRelatedParty party)
    {
        _dbContext.MatterRelatedParties.Add(party);
        await _dbContext.SaveChangesAsync();
        return party;
    }

    public async Task<MatterRelatedParty> UpdateAsync(MatterRelatedParty party)
    {
        _dbContext.MatterRelatedParties.Update(party);
        await _dbContext.SaveChangesAsync();
        return party;
    }
}