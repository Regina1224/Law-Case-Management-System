using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IDocumentRepository
{
    Task<Document> AddAsync(Document document);
    Task<List<Document>> GetByIntakeIdAsync(int intakeId);
    Task<List<Document>> GetByMatterIdAsync(int matterId);
    Task<Document?> GetByIdAsync(int documentId);
}