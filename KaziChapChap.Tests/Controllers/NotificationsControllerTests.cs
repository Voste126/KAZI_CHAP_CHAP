//Notification test cases
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KaziChapChap.API.Controllers;
using KaziChapChap.Core.Models;
using KaziChapChap.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace KaziChapChap.Tests
{
    public class NotificationsControllerTests
    {
        private async Task<KaziDbContext> GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<KaziDbContext>()
                .UseInMemoryDatabase(databaseName: $"KaziDb_{System.Guid.NewGuid()}")
                .Options;

            var context = new KaziDbContext(options);

            // Seed test data
            context.Users.Add(new User { UserID = 1 });
            await context.SaveChangesAsync();

            context.Notifications.Add(new Notification
            {
                NotificationID = 1,
                UserID = 1,
                Message = "Test Notification",
                IsRead = false,
                CreatedAt = System.DateTime.UtcNow
            });

            await context.SaveChangesAsync();
            return context;
        }

        [Fact]
        public async Task GetNotifications_ReturnsAllNotifications()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);

            // Act
            var result = await controller.GetNotifications();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Notification>>>(result);
            var notifications = Assert.IsType<List<Notification>>(actionResult.Value);
            Assert.Single(notifications);
        }

        [Fact]
        public async Task GetNotification_WithValidId_ReturnsNotification()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);

            // Act
            var result = await controller.GetNotification(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Notification>>(result);
            var notification = Assert.IsType<Notification>(actionResult.Value);
            Assert.Equal(1, notification.NotificationID);
        }

        [Fact]
        public async Task GetNotification_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);

            // Act
            var result = await controller.GetNotification(99);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PostNotification_WithValidData_CreatesNotification()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);
            var newNotification = new Notification
            {
                UserID = 1,
                Message = "New Notification",
                IsRead = false
            };

            // Act
            var result = await controller.PostNotification(newNotification);

            // Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdNotification = Assert.IsType<Notification>(actionResult.Value);
            Assert.Equal("New Notification", createdNotification.Message);
        }

        [Fact]
        public async Task PostNotification_WithInvalidUserId_ReturnsBadRequest()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);
            var invalidNotification = new Notification
            {
                UserID = 99, // Invalid user
                Message = "Invalid User Notification"
            };

            // Act
            var result = await controller.PostNotification(invalidNotification);

            // Assert
            var actionResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Invalid UserID. User does not exist.", actionResult.Value);
        }

        [Fact]
        public async Task PutNotification_WithValidData_UpdatesNotification()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);

            // Retrieve existing notification
            var existingNotification = await context.Notifications.FindAsync(1);
            Assert.NotNull(existingNotification); // Ensure it exists

            // Modify the existing instance
            existingNotification.Message = "Updated Notification";
            existingNotification.IsRead = true;

            // Act
            var result = await controller.PutNotification(1, existingNotification);

            // Assert
            Assert.IsType<NoContentResult>(result);
             // Retrieve the updated notification again
            var updatedNotification = await context.Notifications.FindAsync(1);
            Assert.NotNull(updatedNotification);
            Assert.True(updatedNotification.IsRead);
        }


        [Fact]
        public async Task PutNotification_WithInvalidId_ReturnsBadRequest()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);
            var updatedNotification = new Notification
            {
                NotificationID = 1,
                UserID = 1,
                Message = "Updated Notification"
            };

            // Act
            var result = await controller.PutNotification(99, updatedNotification);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task PutNotification_WithNonExistingNotification_ReturnsNotFound()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);
            var updatedNotification = new Notification
            {
                NotificationID = 99,
                UserID = 1,
                Message = "Non-Existent Notification"
            };

            // Act
            var result = await controller.PutNotification(99, updatedNotification);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteNotification_WithValidId_DeletesNotification()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);

            // Act
            var result = await controller.DeleteNotification(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var deletedNotification = await context.Notifications.FindAsync(1);
            Assert.Null(deletedNotification);
        }

        [Fact]
        public async Task DeleteNotification_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);

            // Act
            var result = await controller.DeleteNotification(99);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task MarkAsRead_WithValidId_UpdatesNotification()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);

            // Act
            var result = await controller.MarkAsRead(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var notification = await context.Notifications.FindAsync(1);
            Assert.NotNull(notification);
            Assert.True(notification.IsRead);
        }

        [Fact]
        public async Task MarkAsRead_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var context = await GetDatabaseContext();
            var controller = new NotificationsController(context);

            // Act
            var result = await controller.MarkAsRead(99);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
