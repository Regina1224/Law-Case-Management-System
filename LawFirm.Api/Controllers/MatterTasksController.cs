using LawFirm.Application.DTOs.Matters;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/matters/{matterId}/tasks")]
public class MatterTasksController : ControllerBase
{
    private readonly IMatterService _matterService;

    public MatterTasksController(IMatterService matterService)
    {
        _matterService = matterService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks(
        int matterId,
        [FromQuery] string? status,
        [FromQuery] string? assignedTo,
        [FromQuery] string? priority)
    {
        var result = await _matterService.GetMatterTasksAsync(matterId, status, assignedTo, priority);
        return Ok(ApiResponse<List<MatterTaskListItemDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> AddTask(int matterId, [FromBody] CreateMatterTaskDto dto)
    {
        var result = await _matterService.AddMatterTaskAsync(matterId, dto);
        return Ok(ApiResponse<MatterTaskListItemDto>.Ok(result));
    }
}