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

    public MatterService(
        IMatterRepository matterRepository,
        IClientRepository clientRepository,
        IMatterTypeRepository matterTypeRepository,
        IPracticeAreaRepository practiceAreaRepository)
    {
        _matterRepository = matterRepository;
        _clientRepository = clientRepository;
        _matterTypeRepository = matterTypeRepository;
        _practiceAreaRepository = practiceAreaRepository;
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

    // MAT-02 will rebuild
    public async Task<MatterListItemDto> CreateMatterAsync(CreateMatterDto dto)
    {
        var client = await _clientRepository.GetByIdAsync(dto.ClientId);
        if (client == null)
        {
            throw new KeyNotFoundException($"Client with id {dto.ClientId} was not found.");
        }

        var matterType = await _matterTypeRepository.GetByIdAsync(dto.MatterTypeId);
        if (matterType == null)
        {
            throw new KeyNotFoundException($"MatterType with id {dto.MatterTypeId} was not found.");
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
            Status = dto.Status,
            Priority = dto.Priority,
            Summary = dto.Summary,
            OpenedDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        var saved = await _matterRepository.AddAsync(matter);

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
}