using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using KaziChapChap.API.Controllers;
using KaziChapChap.Core.Models;
using KaziChapChap.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace KaziChapChap.Tests.Controllers
{
    public class ExpensesControllerTests : IDisposable
    {
        private readonly KaziDbContext _context;
        private readonly ExpensesController _controller;

        public ExpensesControllerTests()
        {
            // Use a unique in-memory database name for isolation.
            var options = new DbContextOptionsBuilder<KaziDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new KaziDbContext(options);

            // Seed the Users table with a test user so that UserID = 1 exists.
            _context.Users.Add(new User
            {
                UserID = 1,
                Email = "test@example.com",
                PasswordHash = "hashedpassword"
            });
            _context.SaveChanges();

            _controller = new ExpensesController(_context);

            // Set up a dummy authenticated user to simulate authorized access.
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"), // This must match the seeded user ID.
                new Claim(ClaimTypes.Email, "test@example.com")
            }, "TestAuthentication"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Optionally, seed an Expense record if needed for other tests.
            SeedDatabase();
        }

        private void SeedDatabase()
        {
            // Seed an expense associated with the user.
            _context.Expenses.Add(new Expense
            {
                ExpenseID = 1,
                UserID = 1, // Must match the seeded user's ID.
                Category = "Test Expense",
                Amount = 100.0m,
                Date = DateTime.UtcNow,
                Description = "Test expense description"
            });
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetExpense_ReturnsNotFound_WhenExpenseDoesNotExist()
        {
            // Act
            var result = await _controller.GetExpense(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetExpense_ReturnsExpense_WhenExpenseExists()
        {
            // Act
            var result = await _controller.GetExpense(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Expense>>(result);
            var expense = Assert.IsType<Expense>(actionResult.Value);
            Assert.Equal("Test Expense", expense.Category);
            Assert.Equal(100.0m, expense.Amount);
        }

        [Fact]
        public async Task PostExpense_CreatesExpense()
        {
            // Arrange: Create an expense. The UserID will be overridden by the controller.
            var newExpense = new Expense
            {
                ExpenseID = 2,
                UserID = 999, // Provided value; will be overridden to 1 by the controller.
                Category = "New Expense",
                Amount = 50.0m,
                Date = DateTime.UtcNow,
                Description = "New expense test"
            };

            var initialCount = _context.Expenses.Count();

            // Act
            var result = await _controller.PostExpense(newExpense);

            // Assert
            var createdAtAction = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdExpense = Assert.IsType<Expense>(createdAtAction.Value);
            Assert.Equal("New Expense", createdExpense.Category);
            Assert.Equal(initialCount + 1, _context.Expenses.Count());
            // Ensure that the UserID has been overridden to the authenticated user's ID (1).
            Assert.Equal(1, createdExpense.UserID);
        }

        [Fact]
        public async Task PutExpense_UpdatesExpense_WhenExpenseExists()
        {
            // Arrange: Retrieve the existing expense from the context.
            var existingExpense = await _context.Expenses.FindAsync(1);
            Assert.NotNull(existingExpense);

            // Modify the fields.
            existingExpense.Category = "Updated Expense";
            existingExpense.Amount = 150.0m;

            // Act: Update the expense.
            var result = await _controller.PutExpense(1, existingExpense);

            // Assert
            Assert.IsType<NoContentResult>(result);

            var updatedExpense = await _context.Expenses.FindAsync(1);
            Assert.NotNull(updatedExpense);
            Assert.Equal("Updated Expense", updatedExpense.Category);
            Assert.Equal(150.0m, updatedExpense.Amount);
        }

        [Fact]
        public async Task DeleteExpense_DeletesExpense_WhenExpenseExists()
        {
            // Act
            var result = await _controller.DeleteExpense(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Null(await _context.Expenses.FindAsync(1));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}

