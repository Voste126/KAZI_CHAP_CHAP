// Tests/Controllers/BudgetsControllerTests.cs
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
        // Helper to extract value from ActionResult<T>
        private static T ExtractValue<T>(ActionResult<T> actionResult)
        {
            if (actionResult.Value != null)
                return actionResult.Value;
            if (actionResult.Result is ObjectResult okResult && okResult.Value is T value)
                return value;
            return default!;
        }

        private async Task<KaziDbContext> GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<KaziDbContext>()
                .UseInMemoryDatabase(databaseName: "KaziChapChapTestDb")
                .Options;

            var context = new KaziDbContext(options);
            await context.Database.EnsureDeletedAsync();
            await context.Database.EnsureCreatedAsync();

            // Seed sample data:
            // Budget with UserID = 1 and Budget with UserID = 2.
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
        public async Task GetBudgets_ReturnsOnlyAuthenticatedUserBudgets()
        {
            // Arrange: Dummy user "1" should only see budgets with UserID = 1.
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller, "1");

            // Act
            var result = await controller.GetBudgets();

            // Extract budgets from either Value or Result.
            var budgets = ExtractValue(result);
            Assert.NotNull(budgets); // Fail if null

            // Assert: Only the budget with UserID 1 should be returned.
            Assert.Single(budgets);
            Assert.All(budgets, b => Assert.Equal(1, b.UserID));
        }

        [Fact]
        public async Task GetBudget_WithValidId_ReturnsBudget()
        {
            // Arrange: Dummy user "1" requesting budget 1 (which belongs to user 1).
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller, "1");

            // Act
            var result = await controller.GetBudget(1);

            // Extract the budget.
            var budget = ExtractValue(result);
            Assert.NotNull(budget);

            // Assert
            Assert.Equal(1, budget.BudgetID);
            Assert.Equal("Food", budget.Category);
            Assert.Equal(1, budget.UserID);
        }

        [Fact]
        public async Task GetBudget_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller, "1");

            // Act
            var result = await controller.GetBudget(99);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetBudget_ReturnsUnauthorized_WhenBudgetBelongsToDifferentUser()
        {
            // Arrange: Dummy user "1" requesting budget 2 (which belongs to user 2).
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller, "1");

            // Act
            var result = await controller.GetBudget(2);

            // Assert: Should return Unauthorized.
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result.Result);
            Assert.Equal("You are not authorized to access this budget.", unauthorizedResult.Value);
        }

        [Fact]
        public async Task PostBudget_WithValidData_CreatesBudget()
        {
            // Arrange: Dummy user "1"
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller, "1");

            var newBudget = new Budget
            {
                BudgetID = 3, // This value may be ignored if auto-generated.
                Category = "Entertainment",
                Amount = 200.00m,
                MonthYear = new System.DateTime(2024, 3, 1)
            };

            // Act
            var result = await controller.PostBudget(newBudget);

            // Extract the created budget.
            var createdBudget = ExtractValue(result);
            Assert.NotNull(createdBudget);

            // Assert
            Assert.Equal("Entertainment", createdBudget.Category);
            // The UserID should now equal "1" (from the dummy user)
            Assert.Equal(1, createdBudget.UserID);
        }

        [Fact]
        public async Task PutBudget_WithValidId_UpdatesBudget()
        {
            // Arrange: Dummy user "1" updating budget 1.
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller, "1");

            var updatedBudget = new Budget
            {
                BudgetID = 1,
                UserID = 1,
                Category = "Groceries",
                Amount = 120.00m,
                MonthYear = new System.DateTime(2024, 1, 1)
            };

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
        public async Task PutBudget_ReturnsUnauthorized_WhenUpdatingBudgetOfDifferentUser()
        {
            // Arrange: Dummy user "1" trying to update budget 2 (which belongs to user 2).
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller, "1");

            var updatedBudget = new Budget
            {
                BudgetID = 2,
                UserID = 2, // originally belongs to user 2
                Category = "Transport",
                Amount = 75.00m,
                MonthYear = new System.DateTime(2024, 2, 1)
            };

            // Act
            var result = await controller.PutBudget(2, updatedBudget);

            // Assert: Should return Unauthorized.
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("You are not authorized to update this budget.", unauthorizedResult.Value);
        }

        [Fact]
        public async Task DeleteBudget_WithValidId_RemovesBudget()
        {
            // Arrange: Dummy user "1" deleting budget 1.
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller, "1");

            // Act
            var result = await controller.DeleteBudget(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var deletedBudget = await context.Budgets.FindAsync(1);
            Assert.Null(deletedBudget);
        }

        [Fact]
        public async Task DeleteBudget_ReturnsUnauthorized_WhenDeletingBudgetOfDifferentUser()
        {
            // Arrange: Dummy user "1" trying to delete budget 2 (which belongs to user 2).
            var context = await GetDatabaseContext();
            var controller = new BudgetsController(context);
            SetDummyUser(controller, "1");

            // Act
            var result = await controller.DeleteBudget(2);

            // Assert: Should return Unauthorized.
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("You are not authorized to delete this budget.", unauthorizedResult.Value);
        }
    }
}








