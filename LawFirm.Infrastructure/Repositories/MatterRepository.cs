using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

public class MatterRepository : IMatterRepository
{
    private readonly LawFirmDbContext _dbContext;

    public MatterRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<(List<Matter> Items, int TotalCount)> GetFilteredAsync(
        string? keyword, string? status, int? practiceAreaId,
        string? responsibleLawyer, int? matterTypeId,
        int page, int pageSize)
    {
        IQueryable<Matter> query = _dbContext.Matters
            .Include(m => m.Client)
            .Include(m => m.MatterType)
            .Include(m => m.PracticeArea)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(m =>
                m.MatterTitle.Contains(keyword)
                || m.MatterNumber.Contains(keyword)
                || m.Client.FirstName != null && m.Client.FirstName.Contains(keyword)
                || m.Client.OrganizationName != null && m.Client.OrganizationName.Contains(keyword));
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(m => m.Status == status);
        }

        if (practiceAreaId.HasValue)
        {
            query = query.Where(m => m.PracticeAreaId == practiceAreaId.Value);
        }

        if (!string.IsNullOrEmpty(responsibleLawyer))
        {
            query = query.Where(m => m.ResponsibleLawyer == responsibleLawyer);
        }

        if (matterTypeId.HasValue)
        {
            query = query.Where(m => m.MatterTypeId == matterTypeId.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(m => m.OpenedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<Matter?> GetByIdAsync(int id)
    {
        return await _dbContext.Matters
            .Include(m => m.Client)
            .Include(m => m.MatterType)
            .Include(m => m.PracticeArea)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.MatterId == id);
    }

    public async Task<Matter> AddAsync(Matter matter)
    {
        await _dbContext.Matters.AddAsync(matter);
        await _dbContext.SaveChangesAsync();
        return matter;
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _dbContext.Matters.CountAsync();
    }
}