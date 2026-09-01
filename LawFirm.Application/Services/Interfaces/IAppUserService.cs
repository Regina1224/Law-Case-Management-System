using LawFirm.Application.DTOs.AppUsers;

namespace LawFirm.Application.Services.Interfaces;

public interface IAppUserService
{
    Task<List<AppUserDto>> GetAppUsersAsync();

    Task<AppUserDto> EnsureCurrentUserAsync(string entraObjectId, string displayName, string email);

    Task<AppUserDto> UpdateAppUserRoleAsync(int appUserId, UpdateAppUserRoleDto dto);
}