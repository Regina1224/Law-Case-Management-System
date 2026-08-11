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

    Task<MatterDetailDto> CloseMatterAsync(int id, CloseMatterDto dto);

    Task<MatterDetailDto> ArchiveMatterAsync(int id);

    Task<MatterDetailDto> UnarchiveMatterAsync(int id);

    Task<MatterNoteDto> AddMatterNoteAsync(int matterId, CreateMatterNoteDto dto);

    Task<List<MatterNoteDto>> GetMatterNotesAsync(int matterId);

    Task<MatterRelatedPartyDto> AddMatterRelatedPartyAsync(int matterId, CreateMatterRelatedPartyDto dto);

    Task<List<MatterRelatedPartyDto>> GetMatterRelatedPartiesAsync(int matterId);

    Task<MatterRelatedPartyDto> UpdateMatterRelatedPartyAsync(int matterId, int partyId, UpdateMatterRelatedPartyDto dto);

    Task<MatterRelatedPartyDto> DeactivateMatterRelatedPartyAsync(int matterId, int partyId);

    Task<List<MatterTaskListItemDto>> GetMatterTasksAsync(
        int matterId, string? status, string? assignedTo, string? priority);

    Task<MatterTaskListItemDto> AddMatterTaskAsync(int matterId, CreateMatterTaskDto dto);

    Task<MatterTaskListItemDto> UpdateMatterTaskAsync(int matterId, int taskId, UpdateMatterTaskDto dto);

    Task<List<MatterDeadlineListItemDto>> GetMatterDeadlinesAsync(int matterId);

    Task<MatterDeadlineListItemDto> AddMatterDeadlineAsync(int matterId, CreateMatterDeadlineDto dto);

    Task<MatterDeadlineListItemDto> UpdateMatterDeadlineStatusAsync(int matterId, int deadlineId, UpdateMatterDeadlineStatusDto dto);
}