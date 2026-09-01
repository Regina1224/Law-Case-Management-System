using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

public class AppUserRepository : IAppUserRepository
{
    private readonly LawFirmDbContext _dbContext;

    public AppUserRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<AppUser>> GetAllAsync()
    {
        return await _dbContext.AppUsers
            .AsNoTracking()
            .OrderBy(u => u.DisplayName)
            .ToListAsync();
    }

    public async Task<AppUser?> GetByIdAsync(int id)
    {
        return await _dbContext.AppUsers
            .FirstOrDefaultAsync(u => u.AppUserId == id);
    }

    public async Task<AppUser?> GetByEntraObjectIdAsync(string entraObjectId)
    {
        return await _dbContext.AppUsers
            .FirstOrDefaultAsync(u => u.EntraObjectId == entraObjectId);
    }

    public async Task<AppUser> AddAsync(AppUser appUser)
    {
        await _dbContext.AppUsers.AddAsync(appUser);
        await _dbContext.SaveChangesAsync();
        return appUser;
    }

    public async Task<AppUser> UpdateAsync(AppUser appUser)
    {
        _dbContext.AppUsers.Update(appUser);
        await _dbContext.SaveChangesAsync();
        return appUser;
    }
}