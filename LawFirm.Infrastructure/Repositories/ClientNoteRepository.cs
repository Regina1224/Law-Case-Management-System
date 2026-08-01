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
                .Where(n => n.ClientId == clientId)
                .OrderByDescending(n => n.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<ClientNote> AddAsync(ClientNote note)
        {
            _dbContext.ClientNotes.Add(note);
            await _dbContext.SaveChangesAsync();
            return note;
        }
    }
