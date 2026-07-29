using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories
{
    public class ClientRepository : IClientRepository
    {
        private readonly LawFirmDbContext _dbContext;

        public ClientRepository(LawFirmDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<(List<Client> Items, int TotalCount)> GetFilteredAsync(
            string? keyword,
            string? clientType,
            string? status,
            int page,
            int pageSize)
        {
            // First, obtain the IQueryable property of the Clients table; the query has not yet been actually executed.
            IQueryable<Client> query = _dbContext.Clients.AsNoTracking();


            if(!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(
                    c=>c.ClientCode.Contains(keyword)
                    || c.FirstName != null && c.FirstName.Contains(keyword) 
                    || c.LastName != null && c.LastName.Contains(keyword)
                    || c.OrganizationName != null && c.OrganizationName.Contains(keyword)
                    || c.Email != null && c.Email.Contains(keyword));
            }



            if(!string.IsNullOrEmpty(clientType))
            {
                query = query.Where(c=>c.ClientType == clientType);
            }

            
            if(!string.IsNullOrEmpty(status))
            {
                query = query.Where(c=>c.Status == status);
            }

            // First calculate the total (based on the filtered results before pagination).
            var totalCount = await query.CountAsync();

            // Paging logic
            var skip = (page - 1) * pageSize;
            var take = pageSize;

            var items = await query.OrderByDescending(c=>c.CreatedAt).Skip(skip).Take(take).ToListAsync();

            return (items, totalCount);
        }

        public async Task<Client?> GetByIdAsync(int id)
        {
            return await _dbContext.Clients.FindAsync(id);
        }

        public async Task<Client> AddAsync(Client client)
        {
            _dbContext.Clients.Add(client);
            await _dbContext.SaveChangesAsync();
            return client;
        }
    }
}