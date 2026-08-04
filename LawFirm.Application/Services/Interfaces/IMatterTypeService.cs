using LawFirm.Application.DTOs.ReferenceData;

namespace LawFirm.Application.Services.Interfaces;

public interface IMatterTypeService
{
    Task<IEnumerable<MatterTypeDto>> GetAllActiveAsync();
    Task<MatterTypeDto?> GetByIdAsync(int id);
    Task<MatterTypeDto> CreateAsync(CreateMatterTypeDto dto);
    Task<MatterTypeDto> UpdateAsync(int id, CreateMatterTypeDto dto);
    Task DeleteAsync(int id);
}