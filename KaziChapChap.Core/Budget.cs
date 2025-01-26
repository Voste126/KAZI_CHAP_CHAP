using System;

namespace KaziChapChap.Core.Models
{
    public class Budget
    {
        public int BudgetID { get; set; }
        public int UserID { get; set; }
        public string? Category { get; set; }
        public decimal Amount { get; set; }
        public DateTime MonthYear { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User? User { get; set; }
    }
}