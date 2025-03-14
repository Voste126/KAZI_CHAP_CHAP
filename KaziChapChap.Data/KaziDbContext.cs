using Microsoft.EntityFrameworkCore;
using KaziChapChap.Core.Models;

namespace KaziChapChap.Data
{
    public class KaziDbContext : DbContext
    {
        public KaziDbContext(DbContextOptions<KaziDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                base.OnModelCreating(modelBuilder);

                // Existing relationships
                modelBuilder.Entity<Expense>()
                    .HasOne(e => e.User)
                    .WithMany(u => u.Expenses)
                    .HasForeignKey(e => e.UserID);

                modelBuilder.Entity<Budget>()
                    .HasOne(b => b.User)
                    .WithMany(u => u.Budgets)
                    .HasForeignKey(b => b.UserID);

                modelBuilder.Entity<Notification>()
                    .HasOne(n => n.User)
                    .WithMany(u => u.Notifications)
                    .HasForeignKey(n => n.UserID);

                // Specify column types for decimal properties
                modelBuilder.Entity<Budget>()
                    .Property(b => b.Amount)
                    .HasColumnType("decimal(10,2)");

                modelBuilder.Entity<Expense>()
                    .Property(e => e.Amount)
                    .HasColumnType("decimal(10,2)");

                // New: Configure the relationship between Expense and Budget
                modelBuilder.Entity<Expense>()
                    .HasOne(e => e.Budget)
                    .WithMany(b => b.Expenses)
                    .HasForeignKey(e => e.BudgetID)
                    .OnDelete(DeleteBehavior.Restrict); // Adjust deletion behavior as needed
            }

    }
}