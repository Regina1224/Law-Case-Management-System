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

    public async Task<ClientListItemDto> CreateClientAsync(CreateClientDto dto)
    {
        if (dto.ClientType == "Individual")
        {
            if (string.IsNullOrEmpty(dto.FirstName) || string.IsNullOrEmpty(dto.LastName))
            {
                throw new ArgumentException("First name and last name are required for individual client.");
            }
        }
        else if (dto.ClientType == "Corporate")
        {
            if (string.IsNullOrEmpty(dto.OrganizationName))
            {
                throw new ArgumentException("Organization name is required for corporate client.");
            }
        }
        else
        {
            throw new ArgumentException("Client type must be either 'Individual' or 'Corporate'.");
        }


        var count = await _clientRepository.GetClientCountAsync();
        var clientCode = $"CLI-{(count + 1):D4}";

        var client = new Client
        {
            ClientCode = clientCode,
            ClientType = dto.ClientType,
            Status = dto.Status,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PreferredName = dto.PreferredName,
            DateOfBirth = dto.DateOfBirth,
            OrganizationName = dto.OrganizationName,
            TradingName = dto.TradingName,
            AbnAcn = dto.AbnAcn,
            Email = dto.Email,
            Phone = dto.Phone,
            AddressLine1 = dto.AddressLine1,
            AddressLine2 = dto.AddressLine2,
            City = dto.City,
            State = dto.State,
            Postcode = dto.Postcode,
            Country = dto.Country,
            InternalNotesSummary = dto.InternalNotesSummary,
            IsArchived = false,
            CreatedAt = DateTime.UtcNow
        };

        var savedClient = await _clientRepository.AddAsync(client);

        return new ClientListItemDto
        {
            ClientId = savedClient.ClientId,
            ClientCode = savedClient.ClientCode,
            ClientName = savedClient.ClientType == "Individual"
        ? $"{savedClient.FirstName} {savedClient.LastName}"
        : (savedClient.OrganizationName ?? ""),
            ClientType = savedClient.ClientType,
            Email = savedClient.Email,
            Phone = savedClient.Phone,
            Status = savedClient.Status,
            CreatedAt = savedClient.CreatedAt
        };

    }

}
