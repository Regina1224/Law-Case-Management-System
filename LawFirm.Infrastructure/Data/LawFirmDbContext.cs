using Microsoft.EntityFrameworkCore;

namespace LawFirm.Infrastructure.Data;

public class LawFirmDbContext : DbContext
{
    public LawFirmDbContext(DbContextOptions<LawFirmDbContext> options) : base(options)
    {
        
    }

}
