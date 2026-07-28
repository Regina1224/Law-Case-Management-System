using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LawFirm.Shared.Models;

namespace LawFirm.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MeController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetCurrentUser()
        {
            var displayName = User.FindFirst("name")?.Value 
                ?? User.Identity?.Name 
                ?? "Unknown User";

            var email = User.FindFirst("preferred_username")?.Value 
                ?? User.FindFirst(ClaimTypes.Email)?.Value 
                ?? "";

            // 角色暂时写死，等 AppUsers 表接入后改成查数据库
            var role = "SystemAdmin";

            var result = new
            {
                displayName,
                email,
                role
            };

            return Ok(ApiResponse<object>.Ok(result));
        }
    }
}
