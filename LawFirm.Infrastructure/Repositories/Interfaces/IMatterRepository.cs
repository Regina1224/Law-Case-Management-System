using LawFirm.Domain.Entities;

namespace LawFirm.Infrastructure.Repositories.Interfaces;

public interface IMatterRepository
{
    Task<(List<Matter> Items, int TotalCount)> GetFilteredAsync(
        string? keyword, string? status, int? practiceAreaId,
        string? responsibleLawyer, int? matterTypeId,
        int page, int pageSize);
    Task<Matter?> GetByIdAsync(int id);
    Task<Matter> AddAsync(Matter matter);
    Task<int> GetTotalCountAsync();
}