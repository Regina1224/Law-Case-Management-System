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
    public DbSet<MatterType> MatterTypes => Set<MatterType>();
    public DbSet<Matter> Matters => Set<Matter>();
    public DbSet<MatterNote> MatterNotes => Set<MatterNote>();
    public DbSet<MatterRelatedParty> MatterRelatedParties => Set<MatterRelatedParty>();
    public DbSet<MatterTask> MatterTasks => Set<MatterTask>();


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

        modelBuilder.Entity<Matter>()
            .HasOne(m => m.Client)
            .WithMany()
            .HasForeignKey(m => m.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Matter>()
            .HasOne(m => m.MatterType)
            .WithMany()
            .HasForeignKey(m => m.MatterTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Matter>()
            .HasOne(m => m.PracticeArea)
            .WithMany()
            .HasForeignKey(m => m.PracticeAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Matter>()
            .HasOne(m => m.SourceIntake)
            .WithMany()
            .HasForeignKey(m => m.SourceIntakeId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
    }


    public LawFirmDbContext(DbContextOptions<LawFirmDbContext> options) : base(options)
    {


    }

}

