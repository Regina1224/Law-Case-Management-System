using LawFirm.Application.DTOs.Clients;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Repositories.Interfaces;
using LawFirm.Shared.Models;

namespace LawFirm.Application.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _clientRepository;
    private readonly IClientContactRepository _clientContactRepository;
    private readonly IClientNoteRepository _clientNoteRepository;

    public ClientService(IClientRepository clientRepository, IClientContactRepository clientContactRepository, IClientNoteRepository clientNoteRepository)
    {
        _clientRepository = clientRepository;
        _clientContactRepository = clientContactRepository;
        _clientNoteRepository = clientNoteRepository;
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

    public async Task<ClientDetailDto> GetClientByIdAsync(int id)
    {
        var client = await _clientRepository.GetByIdAsync(id);

        if (client == null)
        {
            throw new KeyNotFoundException($"Client with id {id} was not found.");
        }


        return new ClientDetailDto
        {
            ClientId = client.ClientId,
            ClientCode = client.ClientCode,
            ClientName = client.ClientType == "Individual"
        ? $"{client.FirstName} {client.LastName}"
        : (client.OrganizationName ?? ""),
            ClientType = client.ClientType,
            Status = client.Status,
            FirstName = client.FirstName,
            LastName = client.LastName,
            OrganizationName = client.OrganizationName,
            Email = client.Email,
            Phone = client.Phone,
            AddressLine1 = client.AddressLine1,
            AddressLine2 = client.AddressLine2,
            City = client.City,
            State = client.State,
            Postcode = client.Postcode,
            Country = client.Country,
            InternalNotesSummary = client.InternalNotesSummary,
            CreatedAt = client.CreatedAt

        };
    }

    public async Task<ClientDetailDto> UpdateClientAsync(int id, UpdateClientDto dto)
    {
        var client = await _clientRepository.GetByIdAsync(id);

        if (client == null)
        {
            throw new KeyNotFoundException($"Client with id {id} was not found.");
        }

        // Step 1: Validation (This is unrelated to Corporate/Individual; once completed, the process ends).
        if (client.ClientType == "Individual")
        {
            if (string.IsNullOrEmpty(dto.FirstName) || string.IsNullOrEmpty(dto.LastName))
            {
                throw new ArgumentException("First name and last name are required for individual client.");
            }
        }
        else if (client.ClientType == "Corporate")
        {
            if (string.IsNullOrEmpty(dto.OrganizationName))
            {
                throw new ArgumentException("Organization name is required for corporate client.");
            }
        }


        client.Status = dto.Status;
        client.FirstName = dto.FirstName;
        client.LastName = dto.LastName;
        client.PreferredName = dto.PreferredName;
        client.DateOfBirth = dto.DateOfBirth;
        client.OrganizationName = dto.OrganizationName;
        client.TradingName = dto.TradingName;
        client.AbnAcn = dto.AbnAcn;
        client.Email = dto.Email;
        client.Phone = dto.Phone;
        client.AddressLine1 = dto.AddressLine1;
        client.AddressLine2 = dto.AddressLine2;
        client.City = dto.City;
        client.State = dto.State;
        client.Postcode = dto.Postcode;
        client.Country = dto.Country;
        client.InternalNotesSummary = dto.InternalNotesSummary;
        client.UpdatedAt = DateTime.UtcNow;

        var updatedClient = await _clientRepository.UpdateAsync(client);

        return new ClientDetailDto
        {
            ClientId = updatedClient!.ClientId,
            ClientCode = updatedClient.ClientCode,
            ClientName = updatedClient.ClientType == "Individual"
            ? $"{updatedClient.FirstName} {updatedClient.LastName}"
            : (updatedClient.OrganizationName ?? ""),
            ClientType = updatedClient.ClientType,
            Status = updatedClient.Status,
            FirstName = updatedClient.FirstName,
            LastName = updatedClient.LastName,
            OrganizationName = updatedClient.OrganizationName,
            Email = updatedClient.Email,
            Phone = updatedClient.Phone,
            AddressLine1 = updatedClient.AddressLine1,
            AddressLine2 = updatedClient.AddressLine2,
            City = updatedClient.City,
            State = updatedClient.State,
            Postcode = updatedClient.Postcode,
            Country = updatedClient.Country,
            InternalNotesSummary = updatedClient.InternalNotesSummary,
            CreatedAt = updatedClient.CreatedAt
        };
    }



    public async Task<ClientContactDto> AddClientContactAsync(int clientId, CreateClientContactDto dto)
    {
        // TODO 1: First, use _clientRepository.GetByIdAsync(clientId) to check if the Client exists.
        // If it does not exist, throw a KeyNotFoundException.
        var client = await _clientRepository.GetByIdAsync(clientId);
        if (client == null)
        {
            throw new KeyNotFoundException($"Client with id {clientId} was not found.");
        }

        // TODO 2: Create a ClientContact entity
        // new ClientContact { ClientId = clientId, ContactName = dto.ContactName, ... }
        // Remember IsActive = true, CreatedAt = DateTime.UtcNow
        var clientContact = new ClientContact
        {
            ClientId = clientId,
            ContactName = dto.ContactName,
            RelationshipType = dto.RelationshipType,
            Email = dto.Email,
            Phone = dto.Phone,
            Company = dto.Company,
            Notes = dto.Notes,
            IsActive = true,
            CreatedAt = DateTime.UtcNow

        };

        // TODO 3: Call _clientContactRepository.AddAsync(...) to save
        var savedContact = await _clientContactRepository.AddAsync(clientContact);


        // TODO 4: Convert to ClientContactDto and return
        return new ClientContactDto
        {
            ClientContactId = savedContact.ClientContactId,
            ClientId = savedContact.ClientId,
            ContactName = savedContact.ContactName,
            RelationshipType = savedContact.RelationshipType,
            Email = savedContact.Email,
            Phone = savedContact.Phone,
            Company = savedContact.Company,
            Notes = savedContact.Notes,
            CreatedAt = savedContact.CreatedAt
        };
    }


    public async Task<List<ClientContactDto>> GetClientContactsAsync(int clientId)
    {
        var contacts = await _clientContactRepository.GetByClientIdAsync(clientId);

        return contacts.Select(c => new ClientContactDto
        {
            ClientContactId = c.ClientContactId,
            ClientId = c.ClientId,
            ContactName = c.ContactName,
            RelationshipType = c.RelationshipType,
            Email = c.Email,
            Phone = c.Phone,
            Company = c.Company,
            Notes = c.Notes,
            CreatedAt = c.CreatedAt
        }).ToList();
    }

    public async Task<ClientNoteDto> AddClientNoteAsync(int clientId, CreateClientNoteDto dto)
    {
        var client = await _clientRepository.GetByIdAsync(clientId);
        if (client == null)
        {
            throw new KeyNotFoundException($"Client with id {clientId} was not found.");
        }

        var note = new ClientNote
        {
            ClientId = clientId,
            NoteTitle = dto.NoteTitle,
            NoteContent = dto.NoteContent,
            NoteType = dto.NoteType,
            CreatedAt = DateTime.UtcNow
        };

        var savedNote = await _clientNoteRepository.AddAsync(note);

        return new ClientNoteDto
        {
            ClientNoteId = savedNote.ClientNoteId,
            ClientId = savedNote.ClientId,
            NoteTitle = savedNote.NoteTitle,
            NoteContent = savedNote.NoteContent,
            NoteType = savedNote.NoteType,
            CreatedAt = savedNote.CreatedAt
        };
    }

    public async Task<List<ClientNoteDto>> GetClientNotesAsync(int clientId)
    {
        var notes = await _clientNoteRepository.GetByClientIdAsync(clientId);

        return notes.Select(n => new ClientNoteDto
        {
            ClientNoteId = n.ClientNoteId,
            ClientId = n.ClientId,
            NoteTitle = n.NoteTitle,
            NoteContent = n.NoteContent,
            NoteType = n.NoteType,
            CreatedAt = n.CreatedAt
        }).ToList();
    }
}


