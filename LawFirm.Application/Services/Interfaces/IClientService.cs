using LawFirm.Shared.Models;
using LawFirm.Application.DTOs.Clients;

namespace LawFirm.Application.Services.Interfaces;

public interface IClientService
{
    Task<PagedResultDto<ClientListItemDto>> GetClientsAsync(
        string? keyword, string? clientType, string? status, int page, int pageSize);

}
