using LawFirm.Application.DTOs.Matters;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/matters/{matterId}/documents")]
public class MatterDocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public MatterDocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDocuments(int matterId)
    {
        var result = await _documentService.GetMatterDocumentsAsync(matterId);
        return Ok(ApiResponse<List<MatterDocumentDto>>.Ok(result));
    }
}