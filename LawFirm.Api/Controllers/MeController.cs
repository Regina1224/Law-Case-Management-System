using System.Security.Claims;
using LawFirm.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;
using LawFirm.Shared.Models;

namespace LawFirm.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MeController : ControllerBase
    {
        private readonly IAppUserService _appUserService;

        public MeController(IAppUserService appUserService)
        {
            _appUserService = appUserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCurrentUser()
        {
            var objectId = User.GetObjectId()
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("The current user does not have an Entra object id.");

            var displayName = User.FindFirst("name")?.Value
                ?? User.Identity?.Name
                ?? "Unknown User";

            var email = User.FindFirst("preferred_username")?.Value
                ?? User.FindFirst(ClaimTypes.Email)?.Value
                ?? "";

            var appUser = await _appUserService.EnsureCurrentUserAsync(objectId, displayName, email);

            var result = new
            {
                displayName = appUser.DisplayName,
                email = appUser.Email,
                role = appUser.Role
            };

            return Ok(ApiResponse<object>.Ok(result));
        }
    }
}
