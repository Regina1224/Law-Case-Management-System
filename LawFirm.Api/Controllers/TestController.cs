using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LawFirm.Shared.Models;

namespace LawFirm.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        [HttpGet("public")]
        public ActionResult<ApiResponse<string>> GetPublic()
        {
            var data = "This is public endpoint, no need login";
            return Ok(ApiResponse<string>.Ok(data));
        }

        [HttpGet("protected")]
        [Authorize]
        public IActionResult GetProtected()
        {
            var username = User.Identity?.Name ?? "Unknown";
            var data = $"Hello {username}, you have successfully passed the verification!";
            return Ok(ApiResponse<string>.Ok(data));
        }


    }
}
