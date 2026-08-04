using LawFirm.Application.DTOs.Intakes;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;
using LawFirm.Application.DTOs.Documents;


namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/intakes/{intakeId}/documents")]
public class IntakeDocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public IntakeDocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDocuments(int intakeId)
    {
        var result = await _documentService.GetIntakeDocumentsAsync(intakeId);
        return Ok(ApiResponse<List<IntakeDocumentDto>>.Ok(result));
    }

    [HttpPost]
    [HttpPost]
    public async Task<IActionResult> UploadDocument(int intakeId, [FromForm] UploadIntakeDocumentRequest request)
    {
        var result = await _documentService.UploadIntakeDocumentAsync(
            intakeId, request.File, request.DocumentCategory, request.Description);
        return Ok(ApiResponse<IntakeDocumentDto>.Ok(result));
    }
}