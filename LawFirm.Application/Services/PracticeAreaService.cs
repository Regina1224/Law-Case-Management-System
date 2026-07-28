using LawFirm.Application.DTOs.ReferenceData;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Repositories.Interfaces;
namespace LawFirm.Application.Services;

public class PracticeAreaService : IPracticeAreaService
{
    private readonly IPracticeAreaRepository _practiceAreaRepository;

    public PracticeAreaService(IPracticeAreaRepository practiceAreaRepository)
    {
        _practiceAreaRepository = practiceAreaRepository;
    }
    // Get all PracticeArea
    public async Task<IEnumerable<PracticeAreaDto>> GetAllActiveAsync()
    {
        var practiceAreas = await _practiceAreaRepository.GetAllActiveAsync();
        // entities -> dtos
        return practiceAreas.Select(p => new PracticeAreaDto{Id = p.Id, Name = p.Name, Code = p.Code, DisplayOrder = p.DisplayOrder, IsActive = p.IsActive});

    }

    // Get PracticeArea by id
    public async Task<PracticeAreaDto?> GetByIdAsync(int id)
    {
        var practiceArea = await _practiceAreaRepository.GetByIdAsync(id);
        if (practiceArea == null) return null;
        return new PracticeAreaDto{
            Id = practiceArea.Id, 
            Name = practiceArea.Name, 
            Code = practiceArea.Code, 
            DisplayOrder = practiceArea.DisplayOrder, 
            IsActive = practiceArea.IsActive};
        
    }

    // Create
    public async Task<PracticeAreaDto> CreateAsync(CreatePracticeAreaDto dto)
    {
        // 1. dto -> entity
        var practiceArea = new PracticeArea
        {
            Name = dto.Name,
            Code = dto.Code,
            DisplayOrder = dto.DisplayOrder,
            IsActive = true
        };

        // 2. save to DB
        var created = await _practiceAreaRepository.CreateAsync(practiceArea);

        // 3. entity -> dto
        return new PracticeAreaDto
        {
            Id = created.Id,
            Name = created.Name,
            Code = created.Code,
            DisplayOrder = created.DisplayOrder,
            IsActive = created.IsActive
        };

    }

    // Update
    public async Task<PracticeAreaDto> UpdateAsync(int id, CreatePracticeAreaDto dto)
    {
        var practiceArea = await _practiceAreaRepository.GetByIdAsync(id);
        if (practiceArea == null)
        {
            throw new KeyNotFoundException($"PracticeArea with id {id} not found");
        }
        practiceArea.Name = dto.Name;
        practiceArea.Code = dto.Code;
        practiceArea.DisplayOrder = dto.DisplayOrder;

        var updated = await _practiceAreaRepository.UpdateAsync(practiceArea);

        return new PracticeAreaDto
        {
            Id = updated.Id,
            Name = updated.Name,
            Code = updated.Code,
            DisplayOrder = updated.DisplayOrder,
            IsActive = updated.IsActive
        };
    }

    // Delete
    public async Task DeleteAsync(int id)
    {
        await _practiceAreaRepository.DeleteAsync(id);
    }

}
