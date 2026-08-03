using LawFirm.Domain.Entities;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Repositories;

public class IntakeRepository : IIntakeRepository
{
    private readonly LawFirmDbContext _dbContext;
    public IntakeRepository(LawFirmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<(List<Intake> Items, int TotalCount)> GetFilteredAsync(
            string? keyword,
            string? status,
            int? practiceAreaId,
            string? assignedReviewer,
            int page,
            int pageSize)
    {
        IQueryable<Intake> query = _dbContext.Intakes.Include(i=>i.PracticeArea).AsNoTracking();

        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(
                i => i.IntakeCode.Contains(keyword)
                || i.ProspectiveClientName != null && i.ProspectiveClientName.Contains(keyword)
                || i.IntendedClientType != null && i.IntendedClientType.Contains(keyword)
                || i.Email != null && i.Email.Contains(keyword)
                || i.Phone != null && i.Phone.Contains(keyword));
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(i => i.Status == status);
        }

        if (!string.IsNullOrEmpty(assignedReviewer))
        {
            query = query.Where(i => i.AssignedReviewer == assignedReviewer);
        }

        if (practiceAreaId.HasValue)
        {
            query = query.Where(i => i.PracticeAreaId == practiceAreaId.Value);
        }

        var totalCount = await query.CountAsync();

        var skip = (page - 1) * pageSize;
        var take = pageSize;

        var items = await query.OrderByDescending(i => i.CreatedAt).Skip(skip).Take(take).ToListAsync();

        return (items, totalCount);

    }

    public async Task<Intake?> GetByIdAsync(int id)
    {
        return await _dbContext.Intakes.Include(i=>i.PracticeArea).FirstOrDefaultAsync(i=>i.IntakeId == id);
    }
    public async Task<Intake> AddAsync(Intake intake)
    {
        await _dbContext.Intakes.AddAsync(intake);
        await _dbContext.SaveChangesAsync();
        return intake;

    }
    public async Task<int> GetIntakeCountAsync()
    {
        return await _dbContext.Intakes.CountAsync();
    }

}
