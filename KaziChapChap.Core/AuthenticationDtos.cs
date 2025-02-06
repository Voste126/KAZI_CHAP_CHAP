// Models/AuthenticationDtos.cs
namespace KaziChapChap.Core.Models
{
    public class RegistrationDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthenticationResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public User User { get; set; } = new User();
    }
}
