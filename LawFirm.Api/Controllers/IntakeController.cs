using LawFirm.Application.DTOs.Intakes;
using LawFirm.Application.Services;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class IntakesController : ControllerBase
    {
        private readonly IIntakeService _intakeService;

        public IntakesController(IIntakeService intakeService)
        {
            _intakeService = intakeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetIntakes(
            [FromQuery] string? keyword,
            [FromQuery] string? status,
            [FromQuery] int? practiceAreaId,
            [FromQuery] string? assignedReviewer,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _intakeService.GetIntakesAsync(
                keyword, status, practiceAreaId, assignedReviewer, page, pageSize);

            return Ok(ApiResponse<PagedResultDto<IntakeListItemDto>>.Ok(result));
        }
    }
}