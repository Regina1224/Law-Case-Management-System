using LawFirm.Application.DTOs.Clients;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace LawFirm.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientsController(IClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        public async Task<IActionResult> GetClients(
            [FromQuery] string? keyword,
            [FromQuery] string? clientType,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _clientService.GetClientsAsync(keyword, clientType, status, page, pageSize);

            return Ok(ApiResponse<PagedResultDto<ClientListItemDto>>.Ok(result));
            
        }
    }
}
