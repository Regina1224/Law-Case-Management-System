using LawFirm.Application.DTOs.Matters;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/matters/{matterId}/related-parties")]
public class MatterRelatedPartiesController : ControllerBase
{
    private readonly IMatterService _matterService;

    public MatterRelatedPartiesController(IMatterService matterService)
    {
        _matterService = matterService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRelatedParties(int matterId)
    {
        var result = await _matterService.GetMatterRelatedPartiesAsync(matterId);
        return Ok(ApiResponse<List<MatterRelatedPartyDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> AddRelatedParty(int matterId, [FromBody] CreateMatterRelatedPartyDto dto)
    {
        var result = await _matterService.AddMatterRelatedPartyAsync(matterId, dto);
        return Ok(ApiResponse<MatterRelatedPartyDto>.Ok(result));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRelatedParty(int matterId, int id, [FromBody] UpdateMatterRelatedPartyDto dto)
    {
        var result = await _matterService.UpdateMatterRelatedPartyAsync(matterId, id, dto);
        return Ok(ApiResponse<MatterRelatedPartyDto>.Ok(result));
    }

    [HttpPut("{id}/deactivate")]
    public async Task<IActionResult> DeactivateRelatedParty(int matterId, int id)
    {
        var result = await _matterService.DeactivateMatterRelatedPartyAsync(matterId, id);
        return Ok(ApiResponse<MatterRelatedPartyDto>.Ok(result));
    }
}