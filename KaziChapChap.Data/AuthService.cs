// Data/AuthService.cs
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KaziChapChap.Core.Services;
using KaziChapChap.Core.Models;

namespace KaziChapChap.Data
{
    public class AuthService : IAuthService
    {
        private readonly KaziDbContext _context;

        public AuthService(KaziDbContext context)
        {
            _context = context;
        }

        public async Task<User> Register(User user, string password)
        {
            user.PasswordHash = HashPassword(password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> Login(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || user.PasswordHash == null || !VerifyPassword(user.PasswordHash, password))
            {
                // In a real application, you might return null or throw a specific exception.
                throw new UnauthorizedAccessException("Invalid email or password.");
            }
            return user;
        }

        public async Task<bool> UserExists(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> ResetPassword(string email, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return false;
            }
            user.PasswordHash = HashPassword(newPassword);
            await _context.SaveChangesAsync();
            return true;
        }

        private static string HashPassword(string password)
        {
            // Implement proper password hashing (e.g., using BCrypt)
            return password; // Placeholder for demonstration
        }

        private static bool VerifyPassword(string hashedPassword, string password)
        {
            // Implement proper verification logic
            return hashedPassword == password; // Placeholder for demonstration
        }
    }
}
