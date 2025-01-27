using KaziChapChap.API.Controllers; // Ensure this is the correct namespace for AuthController
using KaziChapChap.Core.Models; // Ensure this is the correct namespace for User
using KaziChapChap.Core.Services; // Ensure this is the correct namespace for IAuthService
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Threading.Tasks;
using Xunit;


namespace KaziChapChap.Tests.Controllers
{
    public class AuthenticationControllerTest
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly AuthController _controller;

        public AuthenticationControllerTest()
        {
            _mockAuthService = new Mock<IAuthService>();
            _controller = new AuthController(_mockAuthService.Object);
        }

        [Fact]
        public async Task Register_ReturnsOkResult_WhenRegistrationIsSuccessful()
        {
            // Arrange
            var user = new User { UserID = 1, Email = "test@example.com" };
            var password = "password";
            _mockAuthService.Setup(service => service.Register(user, password)).ReturnsAsync(user);

            // Act
            var result = await _controller.Register(user, password);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<User>(okResult.Value);
            Assert.Equal(user.Email, returnValue.Email);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenRegistrationFails()
        {
            // Arrange
            var user = new User { UserID = 1, Email = "test@example.com" };
            var password = "password";
            _mockAuthService.Setup(service => service.Register(user, password)).ReturnsAsync((User?)null!);

            // Act
            var result = await _controller.Register(user, password);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Registration failed.", badRequestResult.Value);
        }

        [Fact]
        public async Task Login_ReturnsOkResult_WhenLoginIsSuccessful()
        {
            // Arrange
            var email = "test@example.com";
            var password = "password";
            var user = new User { UserID = 1, Email = email };
            _mockAuthService.Setup(service => service.Login(email, password)).ReturnsAsync(user);

            // Act
            var result = await _controller.Login(email, password);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<User>(okResult.Value);
            Assert.Equal(user.Email, returnValue.Email);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenLoginFails()
        {
            // Arrange
            var email = "test@example.com";
            var password = "password";
            _mockAuthService.Setup(service => service.Login(email, password)).ReturnsAsync((User?)null!);

            // Act
            var result = await _controller.Login(email, password);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid credentials.", unauthorizedResult.Value);
        }
    }
}