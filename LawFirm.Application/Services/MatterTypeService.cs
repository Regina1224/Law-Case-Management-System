using LawFirm.Application.DTOs.ReferenceData;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Repositories.Interfaces;

namespace LawFirm.Application.Services;

public class MatterTypeService : IMatterTypeService
{
    private readonly IMatterTypeRepository _matterTypeRepository;

    public MatterTypeService(IMatterTypeRepository matterTypeRepository)
    {
        _matterTypeRepository = matterTypeRepository;
    }

    public async Task<IEnumerable<MatterTypeDto>> GetAllActiveAsync()
    {
        var matterTypes = await _matterTypeRepository.GetAllActiveAsync();
        return matterTypes.Select(m => new MatterTypeDto
        {
            Id = m.Id,
            Name = m.Name,
            Code = m.Code,
            DisplayOrder = m.DisplayOrder,
            IsActive = m.IsActive
        });
    }

    public async Task<MatterTypeDto?> GetByIdAsync(int id)
    {
        var matterType = await _matterTypeRepository.GetByIdAsync(id);
        if (matterType == null) return null;
        return new MatterTypeDto
        {
            Id = matterType.Id,
            Name = matterType.Name,
            Code = matterType.Code,
            DisplayOrder = matterType.DisplayOrder,
            IsActive = matterType.IsActive
        };
    }

    public async Task<MatterTypeDto> CreateAsync(CreateMatterTypeDto dto)
    {
        var matterType = new MatterType
        {
            Name = dto.Name,
            Code = dto.Code,
            DisplayOrder = dto.DisplayOrder,
            IsActive = true
        };

        var created = await _matterTypeRepository.CreateAsync(matterType);

        return new MatterTypeDto
        {
            Id = created.Id,
            Name = created.Name,
            Code = created.Code,
            DisplayOrder = created.DisplayOrder,
            IsActive = created.IsActive
        };
    }

    public async Task<MatterTypeDto> UpdateAsync(int id, CreateMatterTypeDto dto)
    {
        var matterType = await _matterTypeRepository.GetByIdAsync(id);
        if (matterType == null)
        {
            throw new KeyNotFoundException($"MatterType with id {id} not found");
        }
        matterType.Name = dto.Name;
        matterType.Code = dto.Code;
        matterType.DisplayOrder = dto.DisplayOrder;

        var updated = await _matterTypeRepository.UpdateAsync(matterType);

        return new MatterTypeDto
        {
            Id = updated.Id,
            Name = updated.Name,
            Code = updated.Code,
            DisplayOrder = updated.DisplayOrder,
            IsActive = updated.IsActive
        };
    }

    public async Task DeleteAsync(int id)
    {
        await _matterTypeRepository.DeleteAsync(id);
    }
}