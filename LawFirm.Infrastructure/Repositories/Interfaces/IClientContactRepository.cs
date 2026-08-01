using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

    public interface IClientContactRepository
    {
        Task<List<ClientContact>> GetByClientIdAsync(int clientId);
        Task<ClientContact?> GetByIdAsync(int id);
        Task<ClientContact> AddAsync(ClientContact contact);
        Task<ClientContact?> UpdateAsync(ClientContact contact);
    }
