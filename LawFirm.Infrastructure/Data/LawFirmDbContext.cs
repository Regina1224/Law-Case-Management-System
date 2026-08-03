using Microsoft.EntityFrameworkCore;
using LawFirm.Domain.Entities;
namespace LawFirm.Infrastructure.Data;

public class LawFirmDbContext : DbContext
{
    // Entities
    public DbSet<PracticeArea> PracticeAreas => Set<PracticeArea>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<ClientContact> ClientContacts => Set<ClientContact>();
    public DbSet<ClientNote> ClientNotes => Set<ClientNote>();

    public DbSet<Intake> Intakes => Set<Intake>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Intake>()
        .HasOne(i => i.PracticeArea)
        .WithMany()
        .HasForeignKey(i => i.PracticeAreaId)
        .OnDelete(DeleteBehavior.Restrict);
}
    public LawFirmDbContext(DbContextOptions<LawFirmDbContext> options) : base(options)
    {
        
        
    }

}

