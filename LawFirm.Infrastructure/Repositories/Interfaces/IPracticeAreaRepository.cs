using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IPracticeAreaRepository
{
    // Get all PracticeArea
    Task<IEnumerable<PracticeArea>> GetAllActiveAsync();

    // Get PracticeArea by id
    Task<PracticeArea?> GetByIdAsync(int id);

    // Create
    Task<PracticeArea> CreateAsync(PracticeArea practiceArea);

    // Update
    Task<PracticeArea> UpdateAsync(PracticeArea practiceArea);

    // Delete
    Task DeleteAsync(int id);

}
