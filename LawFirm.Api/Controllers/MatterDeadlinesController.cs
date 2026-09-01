using LawFirm.Application.DTOs.Matters;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/matters/{matterId}/deadlines")]
public class MatterDeadlinesController : ControllerBase
{
    private readonly IMatterService _matterService;

    public MatterDeadlinesController(IMatterService matterService)
    {
        _matterService = matterService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDeadlines(int matterId)
    {
        var result = await _matterService.GetMatterDeadlinesAsync(matterId);
        return Ok(ApiResponse<List<MatterDeadlineListItemDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> AddDeadline(int matterId, [FromBody] CreateMatterDeadlineDto dto)
    {
        var result = await _matterService.AddMatterDeadlineAsync(matterId, dto);
        return Ok(ApiResponse<MatterDeadlineListItemDto>.Ok(result));
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateDeadlineStatus(int matterId, int id, [FromBody] UpdateMatterDeadlineStatusDto dto)
    {
        var result = await _matterService.UpdateMatterDeadlineStatusAsync(matterId, id, dto);
        return Ok(ApiResponse<MatterDeadlineListItemDto>.Ok(result));
    }
}