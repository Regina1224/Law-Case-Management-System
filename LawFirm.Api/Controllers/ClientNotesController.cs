using LawFirm.Application.DTOs.Clients;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers
{
    [ApiController]
    [Route("api/clients/{clientId}/notes")]
    public class ClientNotesController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientNotesController(IClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotes(int clientId)
        {
            var result = await _clientService.GetClientNotesAsync(clientId);
            return Ok(ApiResponse<List<ClientNoteDto>>.Ok(result));
        }

        [HttpPost]
        public async Task<IActionResult> AddNote(int clientId, [FromBody] CreateClientNoteDto dto)
        {
            var result = await _clientService.AddClientNoteAsync(clientId, dto);
            return Ok(ApiResponse<ClientNoteDto>.Ok(result));
        }

        [HttpDelete("{noteId}")]
        public async Task<IActionResult> DeleteNote(int clientId, int noteId)
        {
            var result = await _clientService.DeactivateClientNoteAsync(clientId, noteId);
            return Ok(ApiResponse<ClientNoteDto>.Ok(result));
        }
    }
}