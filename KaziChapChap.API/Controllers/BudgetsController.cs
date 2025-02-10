using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using KaziChapChap.Core.Models; // Budget model
using KaziChapChap.Data;

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

        /// <summary>
        /// Initializes a new instance of the <see cref="BudgetsController"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        public BudgetsController(KaziDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets all budgets for the authenticated user.
        /// </summary>
        /// <returns>A list of budgets.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Budget>>> GetBudgets()
        {
            // Retrieve the authenticated user's ID from the JWT claims.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            // Filter budgets by the authenticated user's ID.
            var budgets = await _context.Budgets
                .Where(b => b.UserID == authenticatedUserId)
                .ToListAsync();

            return Ok(budgets);
        }

        /// <summary>
        /// Gets a specific budget by ID (only if it belongs to the authenticated user).
        /// </summary>
        /// <param name="id">The ID of the budget.</param>
        /// <returns>The budget with the specified ID.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Budget>> GetBudget(int id)
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null)
            {
                return NotFound();
            }

            // Retrieve the authenticated user's ID.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            // Ensure that the budget belongs to the authenticated user.
            if (budget.UserID != authenticatedUserId)
            {
                return Unauthorized("You are not authorized to access this budget.");
            }

            return budget;
        }

        /// <summary>
        /// Creates a new budget.
        /// </summary>
        /// <param name="budget">The budget to create.</param>
        /// <returns>The created budget.</returns>
        [HttpPost]
        public async Task<ActionResult<Budget>> PostBudget(Budget budget)
        {
            // Get the authenticated user's ID from claims.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }
            // Override any provided UserID with the authenticated user's ID.
            budget.UserID = authenticatedUserId;

            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBudget), new { id = budget.BudgetID }, budget);
        }

        /// <summary>
        /// Updates an existing budget.
        /// </summary>
        /// <param name="id">The ID of the budget to update.</param>
        /// <param name="budget">The updated budget data.</param>
        /// <returns>No content if successful.</returns>
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

            // Retrieve the authenticated user's ID.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            // Ensure the budget being updated belongs to the authenticated user.
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
                if (!_context.Budgets.Any(e => e.BudgetID == id))
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

        /// <summary>
        /// Deletes a budget.
        /// </summary>
        /// <param name="id">The ID of the budget to delete.</param>
        /// <returns>No content if successful.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null)
            {
                return NotFound();
            }

            // Retrieve the authenticated user's ID.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
            {
                return Unauthorized();
            }

            // Ensure the budget belongs to the authenticated user.
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

