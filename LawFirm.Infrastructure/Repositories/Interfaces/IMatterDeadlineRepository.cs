using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IMatterDeadlineRepository
{
    Task<List<MatterDeadline>> GetByMatterIdAsync(int matterId);
    Task<MatterDeadline> AddAsync(MatterDeadline deadline);
}