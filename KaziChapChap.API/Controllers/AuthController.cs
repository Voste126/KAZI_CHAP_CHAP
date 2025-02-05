// Controllers/AuthController.cs
using KaziChapChap.Core.Models;
using KaziChapChap.Core.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

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
            return Ok(user);
        }
    }
}
