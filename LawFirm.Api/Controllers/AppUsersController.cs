using LawFirm.Application.DTOs.AppUsers;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SystemAdminOnly")]
public class AppUsersController : ControllerBase
{
    private readonly IAppUserService _appUserService;

    public AppUsersController(IAppUserService appUserService)
    {
        _appUserService = appUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAppUsers()
    {
        var result = await _appUserService.GetAppUsersAsync();
        return Ok(ApiResponse<List<AppUserDto>>.Ok(result));
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateAppUserRole(int id, [FromBody] UpdateAppUserRoleDto dto)
    {
        var result = await _appUserService.UpdateAppUserRoleAsync(id, dto);
        return Ok(ApiResponse<AppUserDto>.Ok(result));
    }
}