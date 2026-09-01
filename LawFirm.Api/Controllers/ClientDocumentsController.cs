using LawFirm.Application.DTOs.Clients;
using LawFirm.Application.DTOs.Documents;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/clients/{clientId}/documents")]
public class ClientDocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public ClientDocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDocuments(int clientId)
    {
        var result = await _documentService.GetClientDocumentsAsync(clientId);
        return Ok(ApiResponse<List<ClientDocumentDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> UploadDocument(int clientId, [FromForm] UploadClientDocumentRequest request)
    {
        var result = await _documentService.UploadClientDocumentAsync(
            clientId, request.File, request.DocumentCategory, request.Description);
        return Ok(ApiResponse<ClientDocumentDto>.Ok(result));
    }
}