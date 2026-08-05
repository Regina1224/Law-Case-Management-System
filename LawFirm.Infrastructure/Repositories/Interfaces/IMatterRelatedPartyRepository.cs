using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IMatterRelatedPartyRepository
{
    Task<List<MatterRelatedParty>> GetByMatterIdAsync(int matterId);
    Task<MatterRelatedParty?> GetByIdAsync(int id);
    Task<MatterRelatedParty> AddAsync(MatterRelatedParty party);
    Task<MatterRelatedParty> UpdateAsync(MatterRelatedParty party);
}