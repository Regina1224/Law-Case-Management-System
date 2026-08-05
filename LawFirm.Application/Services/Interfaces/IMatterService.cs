using LawFirm.Application.DTOs.Matters;
using LawFirm.Shared.Models;

namespace LawFirm.Application.Services.Interfaces;

public interface IMatterService
{
    Task<PagedResultDto<MatterListItemDto>> GetMattersAsync(
        string? keyword, string? status, int? practiceAreaId,
        string? responsibleLawyer, int? matterTypeId,
        int page, int pageSize);

    Task<MatterListItemDto> CreateMatterAsync(CreateMatterDto dto);

    Task<MatterDetailDto> GetMatterByIdAsync(int id);

    Task<MatterDetailDto> UpdateMatterAsync(int id, UpdateMatterDto dto);
}