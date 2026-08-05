using LawFirm.Application.DTOs.Matters;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Repositories.Interfaces;
using LawFirm.Shared.Models;

namespace LawFirm.Application.Services;

public class MatterService : IMatterService
{
    private readonly IMatterRepository _matterRepository;
    private readonly IClientRepository _clientRepository;
    private readonly IMatterTypeRepository _matterTypeRepository;
    private readonly IPracticeAreaRepository _practiceAreaRepository;
    private readonly IMatterNoteRepository _matterNoteRepository;

    public MatterService(
        IMatterRepository matterRepository,
        IClientRepository clientRepository,
        IMatterTypeRepository matterTypeRepository,
        IPracticeAreaRepository practiceAreaRepository,
        IMatterNoteRepository matterNoteRepository)
    {
        _matterRepository = matterRepository;
        _clientRepository = clientRepository;
        _matterTypeRepository = matterTypeRepository;
        _practiceAreaRepository = practiceAreaRepository;
        _matterNoteRepository = matterNoteRepository;
    }

    public async Task<PagedResultDto<MatterListItemDto>> GetMattersAsync(
        string? keyword, string? status, int? practiceAreaId,
        string? responsibleLawyer, int? matterTypeId,
        int page, int pageSize)
    {
        var (items, totalCount) = await _matterRepository.GetFilteredAsync(
            keyword, status, practiceAreaId, responsibleLawyer, matterTypeId, page, pageSize);

        var dtoItems = items.Select(m => new MatterListItemDto
        {
            MatterId = m.MatterId,
            MatterNumber = m.MatterNumber,
            MatterTitle = m.MatterTitle,
            ClientName = m.Client.ClientType == "Individual"
                ? $"{m.Client.FirstName} {m.Client.LastName}".Trim()
                : m.Client.OrganizationName ?? "",
            MatterTypeName = m.MatterType.Name,
            PracticeAreaName = m.PracticeArea.Name,
            ResponsibleLawyer = m.ResponsibleLawyer,
            Status = m.Status,
            Priority = m.Priority,
            OpenedDate = m.OpenedDate
        }).ToList();

        return new PagedResultDto<MatterListItemDto>
        {
            Items = dtoItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<MatterListItemDto> CreateMatterAsync(CreateMatterDto dto)
    {
        
        if (string.IsNullOrWhiteSpace(dto.MatterTitle))
        {
            throw new ArgumentException("Matter title is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.ResponsibleLawyer))
        {
            throw new ArgumentException("Responsible lawyer is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Summary))
        {
            throw new ArgumentException("Matter summary is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Status))
        {
            throw new ArgumentException("Status is required.");
        }

        
        var client = await _clientRepository.GetByIdAsync(dto.ClientId);
        if (client == null)
        {
            throw new KeyNotFoundException($"Client with id {dto.ClientId} was not found.");
        }

        var matterType = await _matterTypeRepository.GetByIdAsync(dto.MatterTypeId);
        if (matterType == null)
        {
            throw new KeyNotFoundException($"Matter type with id {dto.MatterTypeId} was not found.");
        }

        var practiceArea = await _practiceAreaRepository.GetByIdAsync(dto.PracticeAreaId);
        if (practiceArea == null)
        {
            throw new KeyNotFoundException($"Practice area with id {dto.PracticeAreaId} was not found.");
        }

        
        var totalCount = await _matterRepository.GetTotalCountAsync();
        var matterNumber = $"MAT-{(totalCount + 1):D4}";

        
        var matter = new Matter
        {
            MatterNumber = matterNumber,
            ClientId = dto.ClientId,
            MatterTitle = dto.MatterTitle,
            MatterTypeId = dto.MatterTypeId,
            PracticeAreaId = dto.PracticeAreaId,
            ResponsibleLawyer = dto.ResponsibleLawyer,
            SupportingStaff = dto.SupportingStaff,
            Status = dto.Status,
            Priority = dto.Priority,
            Summary = dto.Summary,
            OpenedDate = dto.OpenedDate,
            TargetCloseDate = dto.TargetCloseDate,
            IsConfidential = dto.IsConfidential,
            CreatedAt = DateTime.UtcNow
        };

        var saved = await _matterRepository.AddAsync(matter);

        // 5. 映射返回（复用第 2 步已查出的对象，避免重复查询）
        return new MatterListItemDto
        {
            MatterId = saved.MatterId,
            MatterNumber = saved.MatterNumber,
            MatterTitle = saved.MatterTitle,
            ClientName = client.ClientType == "Individual"
                ? $"{client.FirstName} {client.LastName}".Trim()
                : client.OrganizationName ?? "",
            MatterTypeName = matterType.Name,
            PracticeAreaName = practiceArea.Name,
            ResponsibleLawyer = saved.ResponsibleLawyer,
            Status = saved.Status,
            Priority = saved.Priority,
            OpenedDate = saved.OpenedDate
        };

    }

    public async Task<MatterDetailDto> GetMatterByIdAsync(int id)
    {
        var matter = await _matterRepository.GetByIdAsync(id);
        if (matter == null)
        {
            throw new KeyNotFoundException($"Matter with id {id} was not found.");
        }

        return new MatterDetailDto
        {
            MatterId = matter.MatterId,
            MatterNumber = matter.MatterNumber,
            MatterTitle = matter.MatterTitle,
            ClientId = matter.ClientId,
            ClientCode = matter.Client.ClientCode,
            ClientName = matter.Client.ClientType == "Individual"
                ? $"{matter.Client.FirstName} {matter.Client.LastName}".Trim()
                : matter.Client.OrganizationName ?? "",
            MatterTypeId = matter.MatterTypeId,
            MatterTypeName = matter.MatterType.Name,
            PracticeAreaId = matter.PracticeAreaId,
            PracticeAreaName = matter.PracticeArea.Name,
            ResponsibleLawyer = matter.ResponsibleLawyer,
            SupportingStaff = matter.SupportingStaff,
            Status = matter.Status,
            Priority = matter.Priority,
            Summary = matter.Summary,
            OpenedDate = matter.OpenedDate,
            TargetCloseDate = matter.TargetCloseDate,
            ClosedDate = matter.ClosedDate,
            IsConfidential = matter.IsConfidential,
            CreatedAt = matter.CreatedAt
        };
    }

    public async Task<MatterDetailDto> UpdateMatterAsync(int id, UpdateMatterDto dto)
    {
        var matter = await _matterRepository.GetByIdAsync(id);
        if (matter == null)
        {
            throw new KeyNotFoundException($"Matter with id {id} was not found.");
        }

        if (string.IsNullOrWhiteSpace(dto.ResponsibleLawyer))
        {
            throw new ArgumentException("Responsible lawyer is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Status))
        {
            throw new ArgumentException("Status is required.");
        }

        matter.ResponsibleLawyer = dto.ResponsibleLawyer;
        matter.SupportingStaff = dto.SupportingStaff;
        matter.Status = dto.Status;
        matter.Priority = dto.Priority;
        matter.TargetCloseDate = dto.TargetCloseDate;
        matter.UpdatedAt = DateTime.UtcNow;

        var updated = await _matterRepository.UpdateAsync(matter);

        return new MatterDetailDto
        {
            MatterId = updated.MatterId,
            MatterNumber = updated.MatterNumber,
            MatterTitle = updated.MatterTitle,
            ClientId = updated.ClientId,
            ClientCode = updated.Client.ClientCode,
            ClientName = updated.Client.ClientType == "Individual"
                ? $"{updated.Client.FirstName} {updated.Client.LastName}".Trim()
                : updated.Client.OrganizationName ?? "",
            MatterTypeId = updated.MatterTypeId,
            MatterTypeName = updated.MatterType.Name,
            PracticeAreaId = updated.PracticeAreaId,
            PracticeAreaName = updated.PracticeArea.Name,
            ResponsibleLawyer = updated.ResponsibleLawyer,
            SupportingStaff = updated.SupportingStaff,
            Status = updated.Status,
            Priority = updated.Priority,
            Summary = updated.Summary,
            OpenedDate = updated.OpenedDate,
            TargetCloseDate = updated.TargetCloseDate,
            ClosedDate = updated.ClosedDate,
            IsConfidential = updated.IsConfidential,
            CreatedAt = updated.CreatedAt
        };
    }

    public async Task<MatterNoteDto> AddMatterNoteAsync(int matterId, CreateMatterNoteDto dto)
    {
        var matter = await _matterRepository.GetByIdAsync(matterId);
        if (matter == null)
        {
            throw new KeyNotFoundException($"Matter with id {matterId} was not found.");
        }

        var note = new MatterNote
        {
            MatterId = matterId,
            NoteTitle = dto.NoteTitle,
            NoteContent = dto.NoteContent,
            NoteType = dto.NoteType,
            CreatedAt = DateTime.UtcNow
        };

        var savedNote = await _matterNoteRepository.AddAsync(note);

        return new MatterNoteDto
        {
            MatterNoteId = savedNote.MatterNoteId,
            MatterId = savedNote.MatterId,
            NoteTitle = savedNote.NoteTitle,
            NoteContent = savedNote.NoteContent,
            NoteType = savedNote.NoteType,
            CreatedAt = savedNote.CreatedAt
        };
    }

    public async Task<List<MatterNoteDto>> GetMatterNotesAsync(int matterId)
    {
        var notes = await _matterNoteRepository.GetByMatterIdAsync(matterId);

        return notes.Select(n => new MatterNoteDto
        {
            MatterNoteId = n.MatterNoteId,
            MatterId = n.MatterId,
            NoteTitle = n.NoteTitle,
            NoteContent = n.NoteContent,
            NoteType = n.NoteType,
            CreatedAt = n.CreatedAt
        }).ToList();
    }
}