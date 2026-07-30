using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IClientRepository
{
    Task<(List<Client> Items, int TotalCount)> GetFilteredAsync(
        string? keyword,
        string? clientType,
        string? status,
        int page,
        int pageSize
    );
    Task<Client?> GetByIdAsync(int id);
    Task<Client> AddAsync(Client client);
    Task<int> GetClientCountAsync();
    Task<Client?> UpdateAsync(Client client);

}
