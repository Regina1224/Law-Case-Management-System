using Microsoft.EntityFrameworkCore;
using LawFirm.Domain.Entities;
namespace LawFirm.Infrastructure.Data;

public class LawFirmDbContext : DbContext
{
    // Entities
    public DbSet<PracticeArea> PracticeAreas => Set<PracticeArea>();
    public DbSet<Client> Clients => Set<Client>();
    public LawFirmDbContext(DbContextOptions<LawFirmDbContext> options) : base(options)
    {
        
        
    }

}

