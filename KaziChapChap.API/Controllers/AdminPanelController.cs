using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using KaziChapChap.Core.Models; // Data models: Budget, Expense, User, etc.
using KaziChapChap.Data;
using System.Security.Cryptography;
using KaziChapChap.Core.Services; // For IAuthService
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
            var budgets = await _context.Budgets.ToListAsync();
            return Ok(budgets);
        }

        [HttpGet("budgets/{id}")]
        public async Task<ActionResult<Budget>> GetBudget(int id)
        {
            var budget = await _context.Budgets.FindAsync(id);
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

            _context.Entry(budget).State = EntityState.Modified;

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

            _context.Entry(expense).State = EntityState.Modified;

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

        // DTO for creating a user.
        // The client sends "email" and "password" (plain text) in the request body.
        public class CreateUserDto
        {
            public string? Email { get; set; }
            public string? Password { get; set; }
        }

        [HttpPost("users")]
        public async Task<ActionResult<User>> CreateUser(CreateUserDto dto)
        {
            var user = new User
            {
                Email = dto.Email,
                CreatedAt = System.DateTime.UtcNow
            };

            // Use the AuthService to register the user which hashes the password.
            if (string.IsNullOrEmpty(dto.Password))
            {
                return BadRequest("Password cannot be null or empty.");
            }

            user = await _authService.Register(user, dto.Password);

            return CreatedAtAction(nameof(GetUser), new { id = user.UserID }, user);
        }

        // DTO for updating a user.
        public class UpdateUserDto
        {
            public int UserID { get; set; }
            public string? Email { get; set; }
            public string? Password { get; set; } // If provided, update PasswordHash.
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

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                // Use the ResetPassword method to update the password hash.
                if (string.IsNullOrEmpty(user.Email))
                {
                    return BadRequest("User email cannot be null or empty.");
                }

                bool resetResult = await _authService.ResetPassword(user.Email, dto.Password);
                if (!resetResult)
                {
                    return BadRequest("Failed to reset password.");
                }
            }
            else
            {
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


