using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IMatterNoteRepository
{
    Task<List<MatterNote>> GetByMatterIdAsync(int matterId);
    Task<MatterNote> AddAsync(MatterNote note);
}