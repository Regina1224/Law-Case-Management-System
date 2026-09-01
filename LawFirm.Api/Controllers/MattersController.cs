using LawFirm.Application.DTOs.Matters;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MattersController : ControllerBase
{
    private readonly IMatterService _matterService;

    public MattersController(IMatterService matterService)
    {
        _matterService = matterService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMatters(
        [FromQuery] string? keyword,
        [FromQuery] string? status,
        [FromQuery] int? practiceAreaId,
        [FromQuery] string? responsibleLawyer,
        [FromQuery] int? matterTypeId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _matterService.GetMattersAsync(
            keyword, status, practiceAreaId, responsibleLawyer, matterTypeId, page, pageSize);
        return Ok(ApiResponse<PagedResultDto<MatterListItemDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateMatter([FromBody] CreateMatterDto dto)
    {
        var result = await _matterService.CreateMatterAsync(dto);
        return Ok(ApiResponse<MatterListItemDto>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMatterById(int id)
    {
        var result = await _matterService.GetMatterByIdAsync(id);
        return Ok(ApiResponse<MatterDetailDto>.Ok(result));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMatter(int id, [FromBody] UpdateMatterDto dto)
    {
        var result = await _matterService.UpdateMatterAsync(id, dto);
        return Ok(ApiResponse<MatterDetailDto>.Ok(result));
    }

    [HttpPut("{id}/close")]
    public async Task<IActionResult> CloseMatter(int id, [FromBody] CloseMatterDto dto)
    {
        var result = await _matterService.CloseMatterAsync(id, dto);
        return Ok(ApiResponse<MatterDetailDto>.Ok(result));
    }

    [HttpPut("{id}/archive")]
    public async Task<IActionResult> ArchiveMatter(int id)
    {
        var result = await _matterService.ArchiveMatterAsync(id);
        return Ok(ApiResponse<MatterDetailDto>.Ok(result));
    }

    [HttpPut("{id}/unarchive")]
    public async Task<IActionResult> UnarchiveMatter(int id)
    {
        var result = await _matterService.UnarchiveMatterAsync(id);
        return Ok(ApiResponse<MatterDetailDto>.Ok(result));
    }
}