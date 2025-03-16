using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using KaziChapChap.Data;
using KaziChapChap.Core.Models;

namespace KaziChapChap.API.Controllers
{
    /// <summary>
    /// Provides an endpoint to download all data associated with the logged in user as a CSV file.
    /// The user id is extracted from the JWT payload (using the "nameid" claim).
    /// </summary>
    [Route("api/csv")]
    [ApiController]
    [Authorize]
    public class UserCsvController : ControllerBase
    {
        private readonly KaziDbContext _context;

        public UserCsvController(KaziDbContext context)
        {
            _context = context;
        }

        // GET: api/csv/download
        [HttpGet("download")]
        public async Task<IActionResult> DownloadUserDataCsv()
        {
            // Extract the user id from the JWT claims using the "nameid" claim type.
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("User id not found in token.");
            }

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return BadRequest("Invalid user id.");
            }

            // Retrieve the user record.
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Retrieve budgets and expenses associated with the user.
            var budgets = await _context.Budgets
                .Where(b => b.UserID == userId)
                .ToListAsync();
            var expenses = await _context.Expenses
                .Where(e => e.UserID == userId)
                .ToListAsync();

            // Build CSV content using StringBuilder.
            var csvBuilder = new StringBuilder();

            // --- User Information Section ---
            csvBuilder.AppendLine("User Information");
            csvBuilder.AppendLine("UserID,Email,CreatedAt");
            csvBuilder.AppendLine($"{user.UserID},{EscapeCsv(user.Email)},{user.CreatedAt}");

            csvBuilder.AppendLine(); // blank line

            // --- Budgets Section ---
            csvBuilder.AppendLine("Budgets");
            csvBuilder.AppendLine("BudgetID,Amount,CreatedAt");
            foreach (var budget in budgets)
            {
                csvBuilder.AppendLine($"{budget.BudgetID},{budget.Amount},{budget.CreatedAt}");
            }

            csvBuilder.AppendLine(); // blank line

            // --- Expenses Section ---
            csvBuilder.AppendLine("Expenses");
            csvBuilder.AppendLine("ExpenseID,Description,Amount,CreatedAt");
            foreach (var expense in expenses)
            {
                csvBuilder.AppendLine($"{expense.ExpenseID},{EscapeCsv(expense.Description)},{expense.Amount},{expense.CreatedAt}");
            }

            // Convert the CSV content into a byte array.
            var csvContent = csvBuilder.ToString();
            var bytes = Encoding.UTF8.GetBytes(csvContent);

            // Return the CSV file as a downloadable file.
            return File(bytes, "text/csv", "UserCsvController.csv");
        }

        // Helper method to escape fields that may contain commas, quotes, or newlines.
        private string EscapeCsv(string? field)
        {
            if (string.IsNullOrEmpty(field))
                return "";
            if (field.Contains(',') || field.Contains('"') || field.Contains('\n'))
            {
                // Double up any embedded quotes and wrap the field in quotes.
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }
            return field;
        }
    }
}


