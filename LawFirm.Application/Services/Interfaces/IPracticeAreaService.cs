using LawFirm.Application.DTOs.ReferenceData;

namespace LawFirm.Application.Services.Interfaces;

public interface IPracticeAreaService
{
    // Get all PracticeArea
    Task<IEnumerable<PracticeAreaDto>> GetAllActiveAsync();

    // Get PracticeArea by id
    Task<PracticeAreaDto?> GetByIdAsync(int id);

    // Create
    Task<PracticeAreaDto> CreateAsync(CreatePracticeAreaDto dto);

    // Update
    Task<PracticeAreaDto> UpdateAsync(int id, CreatePracticeAreaDto dto);

    // Delete
    Task DeleteAsync(int id);

}
