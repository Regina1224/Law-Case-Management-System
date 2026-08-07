using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IMatterDeadlineRepository
{
    Task<List<MatterDeadline>> GetByMatterIdAsync(int matterId);
    Task<MatterDeadline?> GetByIdAsync(int id);
    Task<MatterDeadline> AddAsync(MatterDeadline deadline);
    Task<MatterDeadline> UpdateAsync(MatterDeadline deadline);
}