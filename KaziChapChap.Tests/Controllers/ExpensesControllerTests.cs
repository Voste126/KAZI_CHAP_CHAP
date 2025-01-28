using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KaziChapChap.API.Controllers;
using KaziChapChap.Data;
using KaziChapChap.Core.Models;
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
            var options = new DbContextOptionsBuilder<KaziDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;

            _context = new KaziDbContext(options);
            _controller = new ExpensesController(_context);

            SeedDatabase();
        }

        private void SeedDatabase()
        {
            _context.Expenses.Add(new Expense
            {
                ExpenseID = 1,
                UserID = 101,
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
            // Arrange
            var newExpense = new Expense
            {
                ExpenseID = 2,
                UserID = 102,
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
        }

        [Fact]
        public async Task PutExpense_UpdatesExpense_WhenExpenseExists()
        {
            // Arrange: Retrieve the existing expense from the context
            var existingExpense = await _context.Expenses.FindAsync(1);
            Assert.NotNull(existingExpense);

            existingExpense.Category = "Updated Expense";
            existingExpense.Amount = 150.0m;

            // Act: Update the expense
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
