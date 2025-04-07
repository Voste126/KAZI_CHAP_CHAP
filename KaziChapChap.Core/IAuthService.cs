// Services/IAuthService.cs
using KaziChapChap.Core.Models;
using System.Threading.Tasks;

namespace KaziChapChap.Core.Services
{
    public interface IAuthService
    {
        Task<User> Register(User user, string password);
        Task<User?> Login(string email, string password);
        Task<bool> UserExists(string email);
        
        // New methods for password reset flow
        Task<User> GetUserByEmail(string email);
        Task UpdateUser(User user);
        string HashPassword(string password);
    }
}

