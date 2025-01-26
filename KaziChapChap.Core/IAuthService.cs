using KaziChapChap.Core.Models;
namespace KaziChapChap.Core.Services
{
    using System.Threading.Tasks;

    public interface IAuthService
    {
        Task<User> Register(User user, string password);
        Task<User> Login(string email, string password);
        Task<bool> UserExists(string email);
        Task<bool> ResetPassword(string email, string newPassword);
    }
}