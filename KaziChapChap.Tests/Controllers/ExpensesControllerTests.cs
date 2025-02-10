// Tests/Controllers/ExpensesControllerTests.cs
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
using System.Collections.Generic;

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
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            // Seed the Users table with two test users.
            _context.Users.Add(new User
            {
                UserID = 1,
                Email = "test@example.com",
                PasswordHash = "hashedpassword"
            });
            _context.Users.Add(new User
            {
                UserID = 2,
                Email = "other@example.com",
                PasswordHash = "otherhashed"
            });
            _context.SaveChanges();

            _controller = new ExpensesController(_context);

            // Set up a dummy authenticated user (UserID = 1).
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Email, "test@example.com")
            }, "TestAuthentication"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Seed an expense associated with UserID = 1.
            SeedDatabase();
            // Additionally, seed an expense for a different user (UserID = 2).
            _context.Expenses.Add(new Expense
            {
                ExpenseID = 2,
                UserID = 2,
                Category = "Other Expense",
                Amount = 75.0m,
                Date = DateTime.UtcNow,
                Description = "Expense for another user"
            });
            _context.SaveChanges();
        }

        private void SeedDatabase()
        {
            // Seed an expense associated with the authenticated user (UserID = 1).
            _context.Expenses.Add(new Expense
            {
                ExpenseID = 1,
                UserID = 1,
                Category = "Test Expense",
                Amount = 100.0m,
                Date = DateTime.UtcNow,
                Description = "Test expense description"
            });
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetExpenses_ReturnsOnlyAuthenticatedUserExpenses()
        {
            // Act: Get all expenses for authenticated user (UserID = 1).
            var result = await _controller.GetExpenses();

            // Extract the OkObjectResult.
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var expenses = Assert.IsAssignableFrom<IEnumerable<Expense>>(okResult.Value);
            Assert.NotNull(expenses);

            // Assert: Only expenses with UserID = 1 are returned.
            Assert.Single(expenses);
            Assert.All(expenses, e => Assert.Equal(1, e.UserID));
        }

        [Fact]
        public async Task GetExpense_ReturnsExpense_WhenExpenseExists()
        {
            // Act: Request expense with ExpenseID = 1 (belongs to user 1).
            var result = await _controller.GetExpense(1);

            // Extract the expense.
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var expense = Assert.IsType<Expense>(okResult.Value);
            Assert.NotNull(expense);

            // Assert
            Assert.Equal("Test Expense", expense.Category);
            Assert.Equal(100.0m, expense.Amount);
            Assert.Equal(1, expense.UserID);
        }

        [Fact]
        public async Task GetExpense_ReturnsUnauthorized_WhenExpenseBelongsToDifferentUser()
        {
            // Act: Request expense with ExpenseID = 2 (belongs to user 2).
            var result = await _controller.GetExpense(2);

            // Assert: Should return Unauthorized.
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal("You are not authorized to access this expense.", unauthorizedResult.Value);
        }

        [Fact]
        public async Task PostExpense_CreatesExpense()
        {
            // Arrange: Create a new expense; provided UserID will be overridden.
            var newExpense = new Expense
            {
                ExpenseID = 3,
                UserID = 999, // Provided value; will be overridden to 1 by the controller.
                Category = "New Expense",
                Amount = 50.0m,
                Date = DateTime.UtcNow,
                Description = "New expense test"
            };

            var initialCount = _context.Expenses.Count();

            // Act
            var result = await _controller.PostExpense(newExpense);

            // For POST, result.Result should be a CreatedAtActionResult.
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdExpense = Assert.IsType<Expense>(createdResult.Value);

            // Assert
            Assert.Equal("New Expense", createdExpense.Category);
            Assert.Equal(initialCount + 1, _context.Expenses.Count());
            // The UserID should be overridden to 1.
            Assert.Equal(1, createdExpense.UserID);
        }

        [Fact]
        public async Task PutExpense_UpdatesExpense_WhenExpenseExists()
        {
            // Arrange: Retrieve the existing expense (ExpenseID = 1) for UserID = 1.
            var existingExpense = await _context.Expenses.FindAsync(1);
            Assert.NotNull(existingExpense);

            // Modify fields.
            existingExpense.Category = "Updated Expense";
            existingExpense.Amount = 150.0m;

            // Act
            var result = await _controller.PutExpense(1, existingExpense);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var updatedExpense = await _context.Expenses.FindAsync(1);
            Assert.NotNull(updatedExpense);
            Assert.Equal("Updated Expense", updatedExpense.Category);
            Assert.Equal(150.0m, updatedExpense.Amount);
        }

        [Fact]
        public async Task PutExpense_ReturnsUnauthorized_WhenUpdatingExpenseOfDifferentUser()
        {
            // Arrange: Create an expense that belongs to a different user (UserID = 2).
            var expenseForOtherUser = new Expense
            {
                ExpenseID = 4,
                UserID = 2,
                Category = "Other Expense",
                Amount = 80.0m,
                Date = DateTime.UtcNow,
                Description = "Expense not belonging to user 1"
            };
            _context.Expenses.Add(expenseForOtherUser);
            await _context.SaveChangesAsync();

            // Act: Attempt to update expense with ExpenseID = 4 as user 1.
            expenseForOtherUser.Category = "Updated Other Expense";
            var result = await _controller.PutExpense(4, expenseForOtherUser);

            // Assert: Should return Unauthorized.
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("You are not authorized to update this expense.", unauthorizedResult.Value);
        }

        [Fact]
        public async Task DeleteExpense_DeletesExpense_WhenExpenseExists()
        {
            // Act: Delete expense with ExpenseID = 1 (belongs to user 1).
            var result = await _controller.DeleteExpense(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Null(await _context.Expenses.FindAsync(1));
        }

        [Fact]
        public async Task DeleteExpense_ReturnsUnauthorized_WhenDeletingExpenseOfDifferentUser()
        {
            // Act: Attempt to delete expense with ExpenseID = 2 (belongs to user 2).
            var result = await _controller.DeleteExpense(2);

            // Assert: Should return Unauthorized.
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("You are not authorized to delete this expense.", unauthorizedResult.Value);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}


