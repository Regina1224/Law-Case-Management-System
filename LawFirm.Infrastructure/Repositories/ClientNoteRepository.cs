using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

    public class ClientNoteRepository : IClientNoteRepository
    {
        private readonly LawFirmDbContext _dbContext;

        public ClientNoteRepository(LawFirmDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<ClientNote>> GetByClientIdAsync(int clientId)
        {
            return await _dbContext.ClientNotes
                .Where(n => n.ClientId == clientId && n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<ClientNote?> GetByIdAsync(int id)
        {
            return await _dbContext.ClientNotes.FindAsync(id);
        }

        public async Task<ClientNote> AddAsync(ClientNote note)
        {
            _dbContext.ClientNotes.Add(note);
            await _dbContext.SaveChangesAsync();
            return note;
        }

        public async Task<ClientNote> UpdateAsync(ClientNote note)
        {
            _dbContext.ClientNotes.Update(note);
            await _dbContext.SaveChangesAsync();
            return note;
        }
    }
