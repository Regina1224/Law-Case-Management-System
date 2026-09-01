using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IClientNoteRepository
    {
        Task<List<ClientNote>> GetByClientIdAsync(int clientId);
        Task<ClientNote?> GetByIdAsync(int id);
        Task<ClientNote> AddAsync(ClientNote note);
        Task<ClientNote> UpdateAsync(ClientNote note);
    }
