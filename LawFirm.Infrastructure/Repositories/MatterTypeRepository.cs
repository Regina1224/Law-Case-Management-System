using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

public class MatterTypeRepository : IMatterTypeRepository
{
    private readonly LawFirmDbContext _dbContext;

    public MatterTypeRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<MatterType>> GetAllActiveAsync()
    {
        return await _dbContext.MatterTypes
            .Where(m => m.IsActive == true)
            .OrderBy(m => m.DisplayOrder)
            .ToListAsync();
    }

    public async Task<MatterType?> GetByIdAsync(int id)
    {
        return await _dbContext.MatterTypes.FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<MatterType> CreateAsync(MatterType matterType)
    {
        matterType.CreatedAt = DateTime.UtcNow;
        _dbContext.MatterTypes.Add(matterType);
        await _dbContext.SaveChangesAsync();
        return matterType;
    }

    public async Task<MatterType> UpdateAsync(MatterType matterType)
    {
        matterType.UpdatedAt = DateTime.UtcNow;
        _dbContext.MatterTypes.Update(matterType);
        await _dbContext.SaveChangesAsync();
        return matterType;
    }

    public async Task DeleteAsync(int id)
    {
        var matterType = await GetByIdAsync(id);
        if (matterType == null)
        {
            throw new KeyNotFoundException($"MatterType with id {id} not found");
        }
        matterType.IsActive = false;
        await UpdateAsync(matterType);
    }
}
