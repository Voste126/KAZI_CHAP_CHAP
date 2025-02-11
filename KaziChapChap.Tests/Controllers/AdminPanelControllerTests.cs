using System.Net;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using System;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace KaziChapChap.Tests.Controllers
{
    public static class TestTokenHelper
    {
        public static string GenerateToken(string role, string secret, int expireMinutes = 60)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Convert.FromBase64String(secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                    new Claim(ClaimTypes.NameIdentifier, "1"),
                    new Claim(ClaimTypes.Role, role),
                    new Claim(ClaimTypes.Email, "admin@kazichapchap.com")
                }),
                Expires = DateTime.UtcNow.AddMinutes(expireMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    
    public class AdminPanelControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly string _adminToken;
    // Use the generated Base-64 encoded secret for testing
    private const string TestJwtSecret = "ToskpBBxhBd4+F1HzCU/3p9Y6hB4yKrsg/MTK7H9kt8="; 

    public AdminPanelControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
        _adminToken = TestTokenHelper.GenerateToken("Admin", TestJwtSecret);
    }

    [Fact]
    public async Task GetBudgets_AdminToken_ReturnsOk()
    {
        // Arrange: set the Authorization header with the admin token.
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _adminToken);

        // Act: call the admin endpoint for budgets.
        var response = await _client.GetAsync("/api/AdminPanel/budgets");

        // Assert: Should return 200 OK.
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetExpenses_AdminToken_ReturnsOk()
    {
        // Arrange
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _adminToken);

        // Act
        var response = await _client.GetAsync("/api/AdminPanel/expenses");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_AdminToken_ReturnsOk()
    {
        // Arrange
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _adminToken);

        // Act
        var response = await _client.GetAsync("/api/AdminPanel/users");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
}
