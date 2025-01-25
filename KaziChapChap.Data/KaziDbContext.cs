namespace KaziChapChap.Data
{
    using Microsoft.EntityFrameworkCore;
    using KaziChapChap.Core;

    public class KaziDbContext : DbContext
    {
        public KaziDbContext(DbContextOptions<KaziDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
    }
}