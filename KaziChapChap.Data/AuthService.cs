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
                throw new UnauthorizedAccessException("Invalid credentials.");
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
            // Implement password hashing logic
            return password; // Placeholder
        }

        private static bool VerifyPassword(string hashedPassword, string password)
        {
            // Implement password verification logic
            return hashedPassword == password; // Placeholder
        }
    }
}