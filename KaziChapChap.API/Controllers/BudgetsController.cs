using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaziChapChap.Core.Models; // Ensure this is the correct namespace for Budget
using KaziChapChap.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KaziChapChap.API.Controllers
{
    /// <summary>
    /// Handles CRUD operations for budgets.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
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
        /// Gets all budgets.
        /// </summary>
        /// <returns>A list of budgets.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Budget>>> GetBudgets()
        {
            return await _context.Budgets.ToListAsync();
        }

        /// <summary>
        /// Gets a specific budget by ID.
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

            // Manually update properties instead of attaching a new instance
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

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}