using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories;

public class ClientContactRepository : IClientContactRepository
{
    private readonly LawFirmDbContext _dbContext;
    public ClientContactRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async Task<List<ClientContact>> GetByClientIdAsync(int clientId)
    {
        return await _dbContext.ClientContacts
        .Where(c=>c.ClientId == clientId && c.IsActive)
        .AsNoTracking()
        .ToListAsync();
    }
    public async Task<ClientContact?> GetByIdAsync(int id)
    {
        return await _dbContext.ClientContacts.FindAsync(id);
    }
    public async Task<ClientContact> AddAsync(ClientContact contact)
    {
        _dbContext.ClientContacts.Add(contact);
        await _dbContext.SaveChangesAsync();
        return contact;

    }
    public async Task<ClientContact?> UpdateAsync(ClientContact contact)
    {
        _dbContext.ClientContacts.Update(contact);
        await _dbContext.SaveChangesAsync();
        return contact;
    }

}
