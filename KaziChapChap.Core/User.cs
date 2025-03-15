// Models/User.cs
using System;
using System.Collections.Generic;

namespace KaziChapChap.Core.Models
{
    public class User
    {
        public int UserID { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        
        // New fields for registration
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Gender { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}

