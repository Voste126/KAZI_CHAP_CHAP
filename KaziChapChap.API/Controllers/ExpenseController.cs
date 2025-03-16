using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaziChapChap.Core.Models;
using KaziChapChap.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

namespace KaziChapChap.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Only authenticated users can access these endpoints
    public class ExpensesController : ControllerBase
    {
        private readonly KaziDbContext _context;

        public ExpensesController(KaziDbContext context)
        {
            _context = context;
        }

        // GET: api/Expenses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var expenses = await _context.Expenses
                .Where(e => e.UserID == userId)
                .ToListAsync();

            return Ok(expenses);
        }

        // POST: api/Expenses
        [HttpPost]
        public async Task<ActionResult<Expense>> PostExpense(Expense expense)
        {
            // 1. Identify the user from JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            // 2. Associate the expense with the logged-in user
            expense.UserID = userId;

            // 3. Retrieve the budget
            var budget = await _context.Budgets.FindAsync(expense.BudgetID);
            if (budget == null || budget.UserID != userId)
            {
                return BadRequest("Invalid budget specified.");
            }

            // 4. Calculate current total expenses for this budget
            var totalExpenses = _context.Expenses
                .Where(e => e.BudgetID == expense.BudgetID)
                .Sum(e => e.Amount);

            // 5. Check overspending
            var newTotal = totalExpenses + expense.Amount;
            if (newTotal > budget.Amount)
            {
                // Create a notification for overspending attempt
                var overspendNotification = new Notification
                {
                    UserID = userId,
                    Message = $"Overspending blocked! Budget {budget.BudgetID} has {budget.Amount}, total would be {newTotal}.",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(overspendNotification);

                // Save the notification
                await _context.SaveChangesAsync();

                // Return 400 to block the expense creation
                return BadRequest("Overspending attempt blocked. A notification was created.");
            }

            // 6. Otherwise, add and save the expense
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExpense), new { id = expense.ExpenseID }, expense);
        }

        // GET: api/Expenses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Expense>> GetExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return NotFound();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            if (expense.UserID != userId)
            {
                return Forbid("Not your expense.");
            }

            return Ok(expense);
        }

        // PUT: api/Expenses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutExpense(int id, Expense expense)
        {
            if (id != expense.ExpenseID)
            {
                return BadRequest("Expense ID mismatch.");
            }

            var existingExpense = await _context.Expenses.FindAsync(id);
            if (existingExpense == null) return NotFound();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            if (existingExpense.UserID != userId)
            {
                return Forbid("Not your expense to update.");
            }

            // Update fields
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
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Expenses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return NotFound();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            if (expense.UserID != userId)
            {
                return Forbid("Not your expense to delete.");
            }

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
