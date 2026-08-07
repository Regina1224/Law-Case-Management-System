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
}