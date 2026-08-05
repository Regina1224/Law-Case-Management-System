using LawFirm.Shared.Models;
using LawFirm.Application.DTOs.Clients;

namespace LawFirm.Application.Services.Interfaces;

public interface IClientService
{
    Task<PagedResultDto<ClientListItemDto>> GetClientsAsync(
        string? keyword, string? clientType, string? status, int page, int pageSize);

    Task<ClientListItemDto> CreateClientAsync(CreateClientDto dto);

    Task<ClientDetailDto> GetClientByIdAsync(int id);

    Task<ClientDetailDto> UpdateClientAsync(int id, UpdateClientDto dto);

    Task<ClientContactDto> AddClientContactAsync(int clientId, CreateClientContactDto dto);

    Task<List<ClientContactDto>> GetClientContactsAsync(int clientId);

    Task<ClientContactDto> DeactivateClientContactAsync(int clientId, int contactId);

    Task<ClientNoteDto> AddClientNoteAsync(int clientId, CreateClientNoteDto dto);
    
    Task<List<ClientNoteDto>> GetClientNotesAsync(int clientId);
    


}
