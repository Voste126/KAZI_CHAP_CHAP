using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using KaziChapChap.Core.Models;
using KaziChapChap.Data;
using KaziChapChap.Core.Services;
using System;
using System.Security.Cryptography;
using System.Text;

namespace KaziChapChap.API.Controllers
{
    /// <summary>
    /// Provides a full admin panel with CRUD operations for budgets, expenses, and users.
    /// Access is restricted to administrator accounts only.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminPanelController : ControllerBase
    {
        private readonly KaziDbContext _context;
        private readonly IAuthService _authService;

        public AdminPanelController(KaziDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        #region Budgets Endpoints

        [HttpGet("budgets")]
        public async Task<ActionResult<IEnumerable<Budget>>> GetAllBudgets()
        {
            // Include related expenses for full details.
            var budgets = await _context.Budgets
                .Include(b => b.Expenses)
                .ToListAsync();
            return Ok(budgets);
        }

        [HttpGet("budgets/{id}")]
        public async Task<ActionResult<Budget>> GetBudget(int id)
        {
            var budget = await _context.Budgets
                .Include(b => b.Expenses)
                .FirstOrDefaultAsync(b => b.BudgetID == id);
            if (budget == null)
            {
                return NotFound();
            }
            return Ok(budget);
        }

        [HttpPost("budgets")]
        public async Task<ActionResult<Budget>> CreateBudget(Budget budget)
        {
            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBudget), new { id = budget.BudgetID }, budget);
        }

        [HttpPut("budgets/{id}")]
        public async Task<IActionResult> UpdateBudget(int id, Budget budget)
        {
            if (id != budget.BudgetID)
            {
                return BadRequest("Budget ID mismatch.");
            }

            var existingBudget = await _context.Budgets.FindAsync(id);
            if (existingBudget == null)
            {
                return NotFound();
            }

            // Update allowed properties.
            existingBudget.Category = budget.Category;
            existingBudget.Amount = budget.Amount;
            existingBudget.MonthYear = budget.MonthYear;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Budgets.Any(b => b.BudgetID == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("budgets/{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null)
            {
                return NotFound();
            }

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        #endregion

        #region Expenses Endpoints

        [HttpGet("expenses")]
        public async Task<ActionResult<IEnumerable<Expense>>> GetAllExpenses()
        {
            // Admin can see all expenses.
            var expenses = await _context.Expenses.ToListAsync();
            return Ok(expenses);
        }

        [HttpGet("expenses/{id}")]
        public async Task<ActionResult<Expense>> GetExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound();
            }
            return Ok(expense);
        }

        [HttpPost("expenses")]
        public async Task<ActionResult<Expense>> CreateExpense(Expense expense)
        {
            // For admin, both the expense's UserID and BudgetID should be provided.
            // 1. Validate that the budget exists.
            var budget = await _context.Budgets.FindAsync(expense.BudgetID);
            if (budget == null)
            {
                return BadRequest("Invalid budget specified.");
            }

            // 2. Ensure that the budget belongs to the user for whom the expense is being created.
            if (budget.UserID != expense.UserID)
            {
                return BadRequest("The specified budget does not belong to the user.");
            }

            // 3. Calculate current total expenses for the budget.
            var totalExpenses = _context.Expenses
                .Where(e => e.BudgetID == expense.BudgetID)
                .Sum(e => e.Amount);

            var newTotal = totalExpenses + expense.Amount;
            if (newTotal > budget.Amount)
            {
                // Create a notification for the overspending attempt.
                var overspendNotification = new Notification
                {
                    UserID = expense.UserID,
                    Message = $"Overspending blocked! Budget {budget.BudgetID} has a limit of {budget.Amount}, adding this expense would make the total {newTotal}.",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(overspendNotification);
                await _context.SaveChangesAsync();

                return BadRequest("Adding this expense would exceed the budget. A notification was created.");
            }

            // 4. Otherwise, add the expense.
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExpense), new { id = expense.ExpenseID }, expense);
        }

        [HttpPut("expenses/{id}")]
        public async Task<IActionResult> UpdateExpense(int id, Expense expense)
        {
            if (id != expense.ExpenseID)
            {
                return BadRequest("Expense ID mismatch.");
            }

            var existingExpense = await _context.Expenses.FindAsync(id);
            if (existingExpense == null)
            {
                return NotFound();
            }

            _context.Entry(existingExpense).CurrentValues.SetValues(expense);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Expenses.Any(e => e.ExpenseID == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("expenses/{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound();
            }

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        #endregion

        #region Users Endpoints

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        public class CreateUserDto
        {
            public string? Email { get; set; }
            public string? Password { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Gender { get; set; }
        }

        [HttpPost("users")]
        public async Task<ActionResult<User>> CreateUser(CreateUserDto dto)
        {
            if (string.IsNullOrEmpty(dto.Password))
            {
                return BadRequest("Password cannot be null or empty.");
            }

            var user = new User
            {
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Gender = dto.Gender,
                CreatedAt = DateTime.UtcNow
            };

            user = await _authService.Register(user, dto.Password);

            return CreatedAtAction(nameof(GetUser), new { id = user.UserID }, user);
        }

        public class UpdateUserDto
        {
            public int UserID { get; set; }
            public string? Email { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Gender { get; set; }
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            if (id != dto.UserID)
            {
                return BadRequest("User ID mismatch.");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.Email = dto.Email;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Gender = dto.Gender;

            _context.Entry(user).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Users.Any(u => u.UserID == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        #endregion
    }
}




