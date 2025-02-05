// Tests/Controllers/AuthenticationControllerTest.cs
using KaziChapChap.API.Controllers;
using KaziChapChap.Core.Models;
using KaziChapChap.Core.Services;
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
            var registrationDto = new RegistrationDto 
            { 
                Email = "test@example.com", 
                Password = "password" 
            };
            var user = new User { UserID = 1, Email = registrationDto.Email };
            _mockAuthService.Setup(service => service.Register(It.Is<User>(u => u.Email == registrationDto.Email), registrationDto.Password))
                            .ReturnsAsync(user);

            // Act
            var result = await _controller.Register(registrationDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<User>(okResult.Value);
            Assert.Equal(user.Email, returnValue.Email);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenRegistrationFails()
        {
            // Arrange
            var registrationDto = new RegistrationDto 
            { 
                Email = "test@example.com", 
                Password = "password" 
            };
            _mockAuthService.Setup(service => service.Register(It.IsAny<User>(), registrationDto.Password))
                            .ReturnsAsync((User)null!);

            // Act
            var result = await _controller.Register(registrationDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Registration failed.", badRequestResult.Value);
        }

        [Fact]
        public async Task Login_ReturnsOkResult_WhenLoginIsSuccessful()
        {
            // Arrange
            var loginDto = new LoginDto 
            { 
                Email = "test@example.com", 
                Password = "password" 
            };
            var user = new User { UserID = 1, Email = loginDto.Email };
            _mockAuthService.Setup(service => service.Login(loginDto.Email, loginDto.Password))
                            .ReturnsAsync(user);

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<User>(okResult.Value);
            Assert.Equal(user.Email, returnValue.Email);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenLoginFails()
        {
            // Arrange
            var loginDto = new LoginDto 
            { 
                Email = "test@example.com", 
                Password = "password" 
            };
            _mockAuthService.Setup(service => service.Login(loginDto.Email, loginDto.Password))
                            .ReturnsAsync((User)null!);

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid credentials.", unauthorizedResult.Value);
        }
    }
}
