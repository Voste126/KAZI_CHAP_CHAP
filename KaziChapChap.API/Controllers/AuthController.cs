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
using System.Text.RegularExpressions;

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
            var user = new User 
            { 
                Email = registrationDto.Email,
                FirstName = registrationDto.FirstName,
                LastName = registrationDto.LastName,
                Gender = registrationDto.Gender
            };

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

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new LogoutResponseDto { Message = "Logged out successfully." });
        }

        // NEW: Forgot Password endpoint with numeric token generation
        [HttpPost("forgotpassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _authService.GetUserByEmail(dto.Email);
            if (user == null)
            {
                // Always return the same message for security reasons
                return Ok(new { message = "If a user with that email exists, a reset token has been generated." });
            }

            // Generate a 6-digit numeric token as a string.
            var random = new Random();
            var tokenNumeric = random.Next(100000, 999999).ToString();

            // Store the token and its expiry (15 minutes from now)
            user.ResetToken = tokenNumeric;
            user.ResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);
            await _authService.UpdateUser(user);

            // Return the token (for demo purposes, token is returned in response)
            return Ok(new ForgotPasswordResponseDto 
            { 
                ResetToken = tokenNumeric, 
                Message = "Reset token generated. (For demo, token is returned in response)" 
            });
        }

        // NEW: Reset Password endpoint
        [HttpPost("resetpassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _authService.GetUserByEmail(dto.Email);
            if (user == null)
            {
                return BadRequest("Invalid request.");
            }

            if (user.ResetToken != dto.ResetToken || user.ResetTokenExpiry < DateTime.UtcNow)
            {
                return BadRequest("Invalid or expired reset token.");
            }

            if (!IsStrongPassword(dto.NewPassword))
            {
                return BadRequest("Password does not meet strength requirements.");
            }

            // Update the user's password and clear the reset token
            user.PasswordHash = _authService.HashPassword(dto.NewPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _authService.UpdateUser(user);

            return Ok(new { Message = "Password has been reset successfully." });
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
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private bool IsStrongPassword(string pwd)
        {
            return Regex.IsMatch(pwd, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$");
        }
    }

    // DTOs for the endpoints
    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ForgotPasswordResponseDto
    {
        public string ResetToken { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string ResetToken { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class LogoutResponseDto
    {
        public string Message { get; set; } = string.Empty;
    }
}



