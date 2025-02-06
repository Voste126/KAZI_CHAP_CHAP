using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaziChapChap.API.Controllers;
using KaziChapChap.Core.Models;
using KaziChapChap.Data;
using System.Collections.Generic;
using System.Linq;

using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace KaziChapChap.Tests.Controllers
{
    public class BudgetsControllerTests
    {
        private async Task<KaziDbContext> GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<KaziDbContext>()
                .UseInMemoryDatabase(databaseName: "KaziChapChapTestDb")
                .Options;

            var context = new KaziDbContext(options);
            await context.Database.EnsureDeletedAsync();
            await context.Database.EnsureCreatedAsync();

            // Seed data (assumes these budgets belong to some users)
            context.Budgets.Add(new Budget { BudgetID = 1, UserID = 1, Category = "Food", Amount = 100.00m, MonthYear = new System.DateTime(2024, 1, 1) });
            context.Budgets.Add(new Budget { BudgetID = 2, UserID = 2, Category = "Transport", Amount = 50.00m, MonthYear = new System.DateTime(2024, 2, 1) });
            await context.SaveChangesAsync();

            return context;
        }

        private void SetDummyUser(BudgetsController controller, string userId = "1")
        {
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.Name, "testUser"),
                        new Claim(ClaimTypes.NameIdentifier, userId)
                    }, "TestAuthentication"))
                }
            };
        }

        [Fact]
        public async Task GetBudgets_ReturnsAllBudgets()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller);

            // Act
            var result = await controller.GetBudgets();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Budget>>>(result);
            var budgets = Assert.IsType<List<Budget>>(actionResult.Value);
            Assert.Equal(2, budgets.Count);
        }

        [Fact]
        public async Task GetBudget_WithValidId_ReturnsBudget()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller);

            // Act
            var result = await controller.GetBudget(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Budget>>(result);
            var budget = Assert.IsType<Budget>(actionResult.Value);
            Assert.Equal(1, budget.BudgetID);
            Assert.Equal("Food", budget.Category);
        }

        [Fact]
        public async Task GetBudget_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller);

            // Act
            var result = await controller.GetBudget(99);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PostBudget_WithValidData_CreatesBudget()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            // Simulate authenticated user with ID "1"
            SetDummyUser(controller, "1");
            var newBudget = new Budget { BudgetID = 3, /* UserID will be overridden */ Category = "Entertainment", Amount = 200.00m, MonthYear = new System.DateTime(2024, 3, 1) };

            // Act
            var result = await controller.PostBudget(newBudget);

            // Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdBudget = Assert.IsType<Budget>(actionResult.Value);
            Assert.Equal(3, createdBudget.BudgetID);
            Assert.Equal("Entertainment", createdBudget.Category);
            // The UserID should now equal "1" (from the dummy user)
            Assert.Equal(1, createdBudget.UserID);
        }

        [Fact]
        public async Task PutBudget_WithValidId_UpdatesBudget()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller);
            var updatedBudget = new Budget { BudgetID = 1, UserID = 1, Category = "Groceries", Amount = 120.00m, MonthYear = new System.DateTime(2024, 1, 1) };

            // Act
            var result = await controller.PutBudget(1, updatedBudget);

            // Assert
            Assert.IsType<NoContentResult>(result);

            var modifiedBudget = await context.Budgets.FindAsync(1);
            Assert.NotNull(modifiedBudget);
            Assert.Equal("Groceries", modifiedBudget.Category);
            Assert.Equal(120.00m, modifiedBudget.Amount);
        }

        [Fact]
        public async Task PutBudget_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller);
            var updatedBudget = new Budget { BudgetID = 2, UserID = 2, Category = "Transport", Amount = 75.00m, MonthYear = new System.DateTime(2024, 2, 1) };

            // Act
            var result = await controller.PutBudget(1, updatedBudget);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task PutBudget_WithNonExistingId_ReturnsNotFound()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller);
            var updatedBudget = new Budget { BudgetID = 99, UserID = 3, Category = "Utilities", Amount = 60.00m, MonthYear = new System.DateTime(2024, 4, 1) };

            // Act
            var result = await controller.PutBudget(99, updatedBudget);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteBudget_WithValidId_RemovesBudget()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller);

            // Act
            var result = await controller.DeleteBudget(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var deletedBudget = await context.Budgets.FindAsync(1);
            Assert.Null(deletedBudget);
        }

        [Fact]
        public async Task DeleteBudget_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller);

            // Act
            var result = await controller.DeleteBudget(99);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}


