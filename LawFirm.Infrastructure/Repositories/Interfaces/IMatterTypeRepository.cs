using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IMatterTypeRepository
{
    Task<IEnumerable<MatterType>> GetAllActiveAsync();
    Task<MatterType?> GetByIdAsync(int id);
    Task<MatterType> CreateAsync(MatterType matterType);
    Task<MatterType> UpdateAsync(MatterType matterType);
    Task DeleteAsync(int id);
}