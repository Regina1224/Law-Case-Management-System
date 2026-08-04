using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly LawFirmDbContext _dbContext;

    public DocumentRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Document> AddAsync(Document document)
    {
        await _dbContext.Documents.AddAsync(document);
        await _dbContext.SaveChangesAsync();
        return document;
    }

    public async Task<List<Document>> GetByIntakeIdAsync(int intakeId)
    {
        return await _dbContext.Documents
            .Where(d => d.IntakeId == intakeId && !d.IsArchived)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();
    }

    public async Task<Document?> GetByIdAsync(int documentId)
    {
        return await _dbContext.Documents.FirstOrDefaultAsync(d => d.DocumentId == documentId);
    }
}