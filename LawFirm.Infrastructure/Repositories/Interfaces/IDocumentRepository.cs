using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IDocumentRepository
{
    Task<Document> AddAsync(Document document);
    Task<List<Document>> GetByIntakeIdAsync(int intakeId);
    Task<Document?> GetByIdAsync(int documentId);
}