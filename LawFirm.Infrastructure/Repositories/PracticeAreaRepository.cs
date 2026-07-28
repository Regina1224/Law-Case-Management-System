using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

public class PracticeAreaRepository: IPracticeAreaRepository
{
    private readonly LawFirmDbContext _dbContext;
    public PracticeAreaRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Get all PracticeArea
    public async Task<IEnumerable<PracticeArea>> GetAllActiveAsync()
    {
        return await _dbContext.PracticeAreas
            .Where(p => p.IsActive == true)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync();
        
    }
    // Get PracticeArea by id
    public async Task<PracticeArea?> GetByIdAsync(int id)
    {
        return await _dbContext.PracticeAreas.FirstOrDefaultAsync(p => p.Id == id);;
    }

    // Create
    public async Task<PracticeArea> CreateAsync(PracticeArea practiceArea)
    {
        practiceArea.CreatedAt = DateTime.UtcNow;
        _dbContext.PracticeAreas.Add(practiceArea);
        await _dbContext.SaveChangesAsync();
        return practiceArea;
    }

    // Update
    public async Task<PracticeArea> UpdateAsync(PracticeArea practiceArea)
    {
        practiceArea.UpdatedAt = DateTime.UtcNow;
        _dbContext.PracticeAreas.Update(practiceArea);
        await _dbContext.SaveChangesAsync();
        return practiceArea;
    }

    // Delete
    public async Task DeleteAsync(int id)
    {
        var practiceArea = await GetByIdAsync(id);
        if(practiceArea == null)
        {
            throw new KeyNotFoundException($"PracticeArea with id {id} not found");
        }
        practiceArea.IsActive =false;
        await UpdateAsync(practiceArea);
    }


}
