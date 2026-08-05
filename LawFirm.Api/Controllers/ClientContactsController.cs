using LawFirm.Application.DTOs.Clients;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers
{
    [ApiController]
    [Route("api/clients/{clientId}/contacts")]
    //[Authorize]
    public class ClientContactsController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientContactsController(IClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        public async Task<IActionResult> GetContacts(int clientId)
        {
            var result = await _clientService.GetClientContactsAsync(clientId);
            return Ok(ApiResponse<List<ClientContactDto>>.Ok(result));
        }

        [HttpPost]
        public async Task<IActionResult> AddContact(int clientId, [FromBody] CreateClientContactDto dto)
        {
            var result = await _clientService.AddClientContactAsync(clientId, dto);
            return Ok(ApiResponse<ClientContactDto>.Ok(result));
        }

        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> DeactivateContact(int clientId, int id)
        {
            var result = await _clientService.DeactivateClientContactAsync(clientId, id);
            return Ok(ApiResponse<ClientContactDto>.Ok(result));
        }
    }
}