using KaziChapChap.Core.Models;
using KaziChapChap.Core.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using System;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace KaziChapChap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegistrationDto registrationDto)
        {
            var user = new User { Email = registrationDto.Email };
            var registeredUser = await _authService.Register(user, registrationDto.Password);
            if (registeredUser == null)
            {
                return BadRequest("Registration failed.");
            }
            return Ok(registeredUser);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _authService.Login(loginDto.Email, loginDto.Password);
            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }
            var token = GenerateJwtToken(user);
            var response = new AuthenticationResponseDto { Token = token, User = user };
            return Ok(response);
        }

        // New Logout Endpoint
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // For JWT-based authentication, logout is typically handled on the client side.
            return Ok(new LogoutResponseDto { Message = "Logged out successfully." });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var secret = _configuration["Jwt:Secret"];
            if (string.IsNullOrEmpty(secret))
            {
                throw new InvalidOperationException("JWT Secret is not configured.");
            }
            var key = Convert.FromBase64String(secret);
            if (key.Length < 32)
            {
                throw new InvalidOperationException("JWT Secret key must be at least 256 bits (32 bytes) long.");
            }
            // Determine role: if the email is the admin email then assign role "Admin", otherwise "User".
            var role = string.Equals(user.Email, "Admin@gmail.com", StringComparison.OrdinalIgnoreCase) ? "Admin" : "User";

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                    new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                    new Claim(ClaimTypes.Role, role)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                                        SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class LogoutResponseDto
    {
        public required string Message { get; set; }
    }
}
