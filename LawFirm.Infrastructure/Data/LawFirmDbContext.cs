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
    public DbSet<Document> Documents => Set<Document>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Intake>()
            .HasOne(i => i.PracticeArea)
            .WithMany()
            .HasForeignKey(i => i.PracticeAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Document>()
        .HasOne(d => d.Intake)
        .WithMany()
        .HasForeignKey(d => d.IntakeId)
        .OnDelete(DeleteBehavior.Cascade)
        .IsRequired(false);
    }


    public LawFirmDbContext(DbContextOptions<LawFirmDbContext> options) : base(options)
    {


    }

}

