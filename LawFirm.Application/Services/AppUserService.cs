using LawFirm.Application.DTOs.AppUsers;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Repositories.Interfaces;

namespace LawFirm.Application.Services;

public class AppUserService : IAppUserService
{
    private const string DefaultRoleForNewUsers = "SystemAdmin";

    private readonly IAppUserRepository _appUserRepository;

    public AppUserService(IAppUserRepository appUserRepository)
    {
        _appUserRepository = appUserRepository;
    }

    public async Task<List<AppUserDto>> GetAppUsersAsync()
    {
        var appUsers = await _appUserRepository.GetAllAsync();

        return appUsers.Select(MapToAppUserDto).ToList();
    }

    public async Task<AppUserDto> EnsureCurrentUserAsync(string entraObjectId, string displayName, string email)
    {
        var existing = await _appUserRepository.GetByEntraObjectIdAsync(entraObjectId);
        var now = DateTime.UtcNow;

        if (existing == null)
        {
            var newUser = new AppUser
            {
                EntraObjectId = entraObjectId,
                DisplayName = displayName,
                Email = email,
                Role = DefaultRoleForNewUsers,
                IsActive = true,
                LastLoginAt = now,
                CreatedAt = now
            };

            var created = await _appUserRepository.AddAsync(newUser);
            return MapToAppUserDto(created);
        }

        existing.DisplayName = displayName;
        existing.Email = email;
        existing.LastLoginAt = now;
        existing.UpdatedAt = now;

        var updated = await _appUserRepository.UpdateAsync(existing);
        return MapToAppUserDto(updated);
    }

    private static AppUserDto MapToAppUserDto(AppUser appUser)
    {
        return new AppUserDto
        {
            AppUserId = appUser.AppUserId,
            DisplayName = appUser.DisplayName,
            Email = appUser.Email,
            Role = appUser.Role,
            IsActive = appUser.IsActive,
            LastLoginAt = appUser.LastLoginAt
        };
    }
}