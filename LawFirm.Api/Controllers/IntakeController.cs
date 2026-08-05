using Azure;
using LawFirm.Application.DTOs.Intakes;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

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


    [HttpPost]
    public async Task<IActionResult> CreateIntake([FromBody] CreateIntakeDto dto)
    {
        var result = await _intakeService.CreateIntakeAsync(dto);
        return CreatedAtAction(nameof(GetIntakeById), new { id = result.IntakeId }, ApiResponse<IntakeDetailDto>.Ok(result));

    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetIntakeById(int id)
    {
        var result = await _intakeService.GetIntakeByIdAsync(id);
        return Ok(ApiResponse<IntakeDetailDto>.Ok(result));
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIntake(int id, [FromBody] UpdateIntakeDto dto)
    {
        var result = await _intakeService.UpdateIntakeAsync(id, dto);
        return Ok(ApiResponse<IntakeDetailDto>.Ok(result));
    }

    [HttpPost("{id}/convert")]
    public async Task<IActionResult> ConvertIntake(int id, [FromBody] ConvertIntakeDto dto)
    {
        var result = await _intakeService.ConvertIntakeAsync(id, dto);
        return Ok(ApiResponse<ConvertIntakeResultDto>.Ok(result));
    }
}