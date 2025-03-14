using System;

namespace KaziChapChap.Core.Models
{
    public class Expense
        {
            public int ExpenseID { get; set; }
            public int UserID { get; set; }
            public decimal Amount { get; set; }
            public string? Category { get; set; }
            public DateTime Date { get; set; }
            public string? Description { get; set; }
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

            // New: Foreign key to Budget
            public int BudgetID { get; set; }

            // Navigation property for User
            public User? User { get; set; }
            
            // New: Navigation property for Budget
            public Budget? Budget { get; set; }
        }

}