using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

public class MatterNoteRepository : IMatterNoteRepository
{
    private readonly LawFirmDbContext _dbContext;

    public MatterNoteRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<MatterNote>> GetByMatterIdAsync(int matterId)
    {
        return await _dbContext.MatterNotes
            .Where(n => n.MatterId == matterId && n.IsActive)
            .OrderByDescending(n => n.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<MatterNote?> GetByIdAsync(int id)
    {
        return await _dbContext.MatterNotes.FindAsync(id);
    }

    public async Task<MatterNote> AddAsync(MatterNote note)
    {
        _dbContext.MatterNotes.Add(note);
        await _dbContext.SaveChangesAsync();
        return note;
    }

    public async Task<MatterNote> UpdateAsync(MatterNote note)
    {
        _dbContext.MatterNotes.Update(note);
        await _dbContext.SaveChangesAsync();
        return note;
    }
}