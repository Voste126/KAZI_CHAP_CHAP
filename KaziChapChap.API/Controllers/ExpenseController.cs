using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaziChapChap.Core.Models;
using KaziChapChap.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace KaziChapChap.API.Controllers
{
    /// <summary>
    /// Handles CRUD operations for expenses.
    /// </summary>
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
            // Retrieve the authenticated user's ID.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            // Filter expenses by the authenticated user's ID.
            var expenses = await _context.Expenses
                .Where(e => e.UserID == authenticatedUserId)
                .ToListAsync();

            return Ok(expenses);
        }

        // GET: api/Expenses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Expense>> GetExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound();
            }

            // Retrieve the authenticated user's ID.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }
            
            // Ensure that the expense belongs to the authenticated user.
            if (expense.UserID != authenticatedUserId)
            {
                return Unauthorized("You are not authorized to access this expense.");
            }

            return Ok(expense);
        }

        // POST: api/Expenses
        [HttpPost]
        public async Task<ActionResult<Expense>> PostExpense(Expense expense)
        {
            // Retrieve the authenticated user's ID from JWT claims.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            // Override any provided UserID with the authenticated user's ID.
            expense.UserID = authenticatedUserId;

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExpense), new { id = expense.ExpenseID }, expense);
        }

        // PUT: api/Expenses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutExpense(int id, Expense expense)
        {
            if (id != expense.ExpenseID)
            {
                return BadRequest();
            }

            var existingExpense = await _context.Expenses.FindAsync(id);
            if (existingExpense == null)
            {
                return NotFound();
            }

            // Retrieve the authenticated user's ID.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            // Ensure that the expense belongs to the authenticated user.
            if (existingExpense.UserID != authenticatedUserId)
            {
                return Unauthorized("You are not authorized to update this expense.");
            }

            // Update the tracked entity’s values with those from the incoming object.
            // You can also selectively update properties if needed.
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

        // DELETE: api/Expenses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound();
            }

            // Retrieve the authenticated user's ID.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            // Ensure the expense belongs to the authenticated user.
            if (expense.UserID != authenticatedUserId)
            {
                return Unauthorized("You are not authorized to delete this expense.");
            }

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
