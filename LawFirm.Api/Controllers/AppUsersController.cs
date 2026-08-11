using LawFirm.Application.DTOs.AppUsers;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
}