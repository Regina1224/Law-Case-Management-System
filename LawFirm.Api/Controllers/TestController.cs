using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace LawFirm.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        [HttpGet("public")]
        public IActionResult GetPublic()
        {
            return Ok(new {message = "This is public endpoint, no need login"});
        }

        [HttpGet("protected")]
        [Authorize]
        public IActionResult GetProtected()
        {
            var username = User.Identity?.Name ?? "Unknown";
            return Ok(new {message = $"Hello {username}, you have successfully passed the verification! "});
        }


    }
}
