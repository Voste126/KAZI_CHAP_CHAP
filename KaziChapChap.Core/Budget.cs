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

            // Navigation property for User
            public User? User { get; set; }
            
            // New: Navigation property for related Expenses
            public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        }

}
