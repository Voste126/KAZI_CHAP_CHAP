using KaziChapChap.Core.Models;
using KaziChapChap.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using System.Text;
using System;

namespace KaziChapChap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]  // Require authentication
    public class UserController : ControllerBase
    {
        private readonly KaziDbContext _context;

        public UserController(KaziDbContext context)
        {
            _context = context;
        }

        
        /// <summary>
        /// Gets the current user's profile based on the JWT.
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            // Extract user id from the JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID not found in token.");

            if (!int.TryParse(userIdClaim, out int userId))
                return BadRequest("Invalid user ID in token.");

            // Retrieve the user from the database
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if (user == null)
                return NotFound("User not found.");

            // Return the user data (excluding password hash)
            return Ok(new
            {
                user.UserID,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Gender,
                user.CreatedAt
            });
        }

        /// <summary>
        /// Updates the current user's profile based on the JWT.
        /// </summary>
        // PUT: api/User/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            // Identify the logged-in user
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            // Retrieve user
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Update fields
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Gender = dto.Gender;
            user.Email = dto.Email;

            // Save changes
            await _context.SaveChangesAsync();

            // AFTER saving, create a notification
            var notification = new Notification
            {
                UserID = userId,
                Message = "You have updated your profile successfully.",
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Return updated data
            return Ok(new
            {
                user.UserID,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Gender,
                user.CreatedAt
            });
        }

        /// <summary>
        /// Allows the user to change their password, verifying the old password first.
        /// </summary>
        [HttpPut("profile/change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            // Extract user ID from the JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID not found in token.");

            if (!int.TryParse(userIdClaim, out int userId))
                return BadRequest("Invalid user ID in token.");

            // Retrieve the user
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if (user == null)
                return NotFound("User not found.");

            // Verify old password
            if (!VerifyPassword(user.PasswordHash, dto.OldPassword))
            {
                return BadRequest("Old password is incorrect.");
            }

            // Optionally check new password requirements on the server side.
            if (!IsStrongPassword(dto.NewPassword))
            {
                return BadRequest("New password does not meet complexity requirements.");
            }

            // Hash and store the new password
            user.PasswordHash = HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Password changed successfully.");
        }

        // ------------------ Helper Methods ------------------

        /// <summary>
        /// Verifies if the given plain-text password matches the hashed password.
        /// </summary>
        private bool VerifyPassword(string? hashedPassword, string password)
        {
            if (string.IsNullOrEmpty(hashedPassword)) 
                return false;

            var hashOfInput = HashPassword(password);
            return string.Equals(hashedPassword, hashOfInput, StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Hashes a plain-text password using SHA256.
        /// </summary>
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                byte[] hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return BitConverter.ToString(hashedBytes).Replace("-", "").ToLowerInvariant();
            }
        }

        /// <summary>
        /// Checks if a password meets the basic complexity requirements:
        /// at least 8 chars, uppercase, lowercase, digit, special char.
        /// </summary>
        private bool IsStrongPassword(string pwd)
        {
            if (pwd.Length < 8) return false;
            if (!Regex.IsMatch(pwd, @"[A-Z]")) return false;
            if (!Regex.IsMatch(pwd, @"[a-z]")) return false;
            if (!Regex.IsMatch(pwd, @"\d"))   return false;
            if (!Regex.IsMatch(pwd, @"[\W_]"))return false;
            return true;
        }
    }

    /// <summary>
    /// DTO for updating user profile details.
    /// </summary>
    public class UpdateProfileDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Gender { get; set; }
        public string? Email { get; set; }
    }

    /// <summary>
    /// DTO for changing a user's password.
    /// </summary>
    public class ChangePasswordDto
    {
        public string OldPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}

