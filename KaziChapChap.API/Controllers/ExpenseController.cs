using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaziChapChap.Core.Models; // Ensure this is the correct namespace for Expense
using KaziChapChap.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KaziChapChap.API.Controllers
{
    /// <summary>
    /// Handles CRUD operations for expenses.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ExpensesController : ControllerBase
    {
        private readonly KaziDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="ExpensesController"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        public ExpensesController(KaziDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets all expenses.
        /// </summary>
        /// <returns>A list of expenses.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
        {
            return await _context.Expenses.ToListAsync();
        }

        /// <summary>
        /// Gets a specific expense by ID.
        /// </summary>
        /// <param name="id">The ID of the expense.</param>
        /// <returns>The expense with the specified ID.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Expense>> GetExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);

            if (expense == null)
            {
                return NotFound();
            }

            return expense;
        }

        /// <summary>
        /// Creates a new expense.
        /// </summary>
        /// <param name="expense">The expense to create.</param>
        /// <returns>The created expense.</returns>
        [HttpPost]
        public async Task<ActionResult<Expense>> PostExpense(Expense expense)
        {
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExpense), new { id = expense.ExpenseID }, expense);
        }

        /// <summary>
        /// Updates an existing expense.
        /// </summary>
        /// <param name="id">The ID of the expense to update.</param>
        /// <param name="expense">The updated expense data.</param>
        /// <returns>No content if successful.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutExpense(int id, Expense expense)
        {
            if (id != expense.ExpenseID)
            {
                return BadRequest();
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

        /// <summary>
        /// Deletes an expense.
        /// </summary>
        /// <param name="id">The ID of the expense to delete.</param>
        /// <returns>No content if successful.</returns>
        [HttpDelete("{id}")]
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
    }
}