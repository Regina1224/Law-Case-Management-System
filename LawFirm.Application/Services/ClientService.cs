using LawFirm.Application.DTOs.Clients;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Repositories.Interfaces;
using LawFirm.Shared.Models;

namespace LawFirm.Application.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _clientRepository;

    public ClientService(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<PagedResultDto<ClientListItemDto>> GetClientsAsync(
        string? keyword, string? clientType, string? status, int page, int pageSize)
    {
        var (items, totalCount) = await _clientRepository.GetFilteredAsync(
            keyword, clientType, status, page, pageSize
        );

        // items（List<Client>）-> List<ClientListItemDto>
        var dtoItems = items.Select(c => new ClientListItemDto
        {
            ClientId = c.ClientId,
            ClientCode = c.ClientCode,
            ClientName = c.ClientType == "Individual"
            ? $"{c.FirstName} {c.LastName}"
            : (c.OrganizationName ?? ""),
            ClientType = c.ClientType,
            Email = c.Email,
            Phone = c.Phone,
            Status = c.Status,
            CreatedAt = c.CreatedAt
        }).ToList();
        
        return new PagedResultDto<ClientListItemDto>
            {
                Items = dtoItems,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
    }

}
