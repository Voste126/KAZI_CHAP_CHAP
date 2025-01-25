namespace KaziChapChap.Core;

public class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public required string PasswordSalt { get; set; }
}


// Interface for the Auth Service
public interface IAuthService
{
    Task<User> Register(User user, string password);
    Task<User> Login(string email, string password);
    Task<bool> UserExists(string email);
    Task<bool> ResetPassword(string email, string newPassword);
}