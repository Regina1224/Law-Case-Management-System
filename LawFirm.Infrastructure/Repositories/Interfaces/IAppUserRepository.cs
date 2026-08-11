using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IAppUserRepository
{
    Task<List<AppUser>> GetAllAsync();
    Task<AppUser?> GetByIdAsync(int id);
    Task<AppUser?> GetByEntraObjectIdAsync(string entraObjectId);
    Task<AppUser> AddAsync(AppUser appUser);
    Task<AppUser> UpdateAsync(AppUser appUser);
}