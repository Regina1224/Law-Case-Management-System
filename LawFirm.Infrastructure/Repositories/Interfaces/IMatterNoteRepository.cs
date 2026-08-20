using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IMatterNoteRepository
{
    Task<List<MatterNote>> GetByMatterIdAsync(int matterId);
    Task<MatterNote?> GetByIdAsync(int id);
    Task<MatterNote> AddAsync(MatterNote note);
    Task<MatterNote> UpdateAsync(MatterNote note);
}