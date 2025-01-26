using KaziChapChap.Core.Models; // Ensure this is the correct namespace for User
using KaziChapChap.Core.Services; // Ensure this is the correct namespace for IAuthService
using Microsoft.AspNetCore.Mvc;

namespace KaziChapChap.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user, string password)
        {
            var registeredUser = await _authService.Register(user, password);
            if (registeredUser == null)
            {
                return BadRequest("Registration failed.");
            }
            return Ok(registeredUser);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(string email, string password)
        {
            var user = await _authService.Login(email, password);
            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }
            return Ok(user);
        }
    }
}