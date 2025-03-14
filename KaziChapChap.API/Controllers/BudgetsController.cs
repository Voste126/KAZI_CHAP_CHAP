using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using KaziChapChap.Core.Models;
using KaziChapChap.Data;
using System.Security.Claims;

namespace KaziChapChap.API.Controllers
{
    /// <summary>
    /// Handles CRUD operations for budgets.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Protect all endpoints with JWT authentication
    public class BudgetsController : ControllerBase
    {
        private readonly KaziDbContext _context;

        public BudgetsController(KaziDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Budget>>> GetBudgets()
        {
            // Retrieve the authenticated user's ID.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            // Get budgets that belong to the authenticated user, including related expenses.
            var budgets = await _context.Budgets
                .Include(b => b.Expenses)
                .Where(b => b.UserID == authenticatedUserId)
                .ToListAsync();

            return Ok(budgets);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Budget>> GetBudget(int id)
        {
            var budget = await _context.Budgets
                .Include(b => b.Expenses)
                .FirstOrDefaultAsync(b => b.BudgetID == id);
            if (budget == null)
            {
                return NotFound();
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            if (budget.UserID != authenticatedUserId)
            {
                return Unauthorized("You are not authorized to access this budget.");
            }

            return Ok(budget);
        }

        [HttpPost]
        public async Task<ActionResult<Budget>> PostBudget(Budget budget)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }
            // Ensure the budget is assigned to the authenticated user.
            budget.UserID = authenticatedUserId;

            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBudget), new { id = budget.BudgetID }, budget);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutBudget(int id, Budget budget)
        {
            if (id != budget.BudgetID)
            {
                return BadRequest();
            }

            var existingBudget = await _context.Budgets.FindAsync(id);
            if (existingBudget == null)
            {
                return NotFound();
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            if (existingBudget.UserID != authenticatedUserId)
            {
                return Unauthorized("You are not authorized to update this budget.");
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null)
            {
                return NotFound();
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            if (budget.UserID != authenticatedUserId)
            {
                return Unauthorized("You are not authorized to delete this budget.");
            }

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}


