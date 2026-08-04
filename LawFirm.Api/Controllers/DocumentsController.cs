using LawFirm.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers;

[ApiController]
[Route("api/documents")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDocument(int id)
    {
        var (fileStream, contentType, fileName) = await _documentService.DownloadIntakeDocumentAsync(id);
        return File(fileStream, contentType, fileName);
    }
}