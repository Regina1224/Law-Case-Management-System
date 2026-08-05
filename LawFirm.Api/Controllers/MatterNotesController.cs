using LawFirm.Application.DTOs.Matters;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/matters/{matterId}/notes")]
public class MatterNotesController : ControllerBase
{
    private readonly IMatterService _matterService;

    public MatterNotesController(IMatterService matterService)
    {
        _matterService = matterService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotes(int matterId)
    {
        var result = await _matterService.GetMatterNotesAsync(matterId);
        return Ok(ApiResponse<List<MatterNoteDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> AddNote(int matterId, [FromBody] CreateMatterNoteDto dto)
    {
        var result = await _matterService.AddMatterNoteAsync(matterId, dto);
        return Ok(ApiResponse<MatterNoteDto>.Ok(result));
    }
}