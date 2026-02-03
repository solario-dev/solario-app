using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Solario.Models;
using Solario.Repository;
using BCrypt.Net;
using MongoDB.Bson;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Solario.Services;

namespace Solario.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserRepository _repo;
        private readonly IConfiguration _configuration;
        private readonly SimulationService _simulationService;

        public UsersController(UserRepository repo, IConfiguration configuration, SimulationService simulationService)
        {
            _repo = repo;
            _configuration = configuration;
            _simulationService = simulationService;
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetMyClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            var isAdmin = User.IsInRole("Admin");
            return Ok(new { IsAdmin = isAdmin, Claims = claims });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _repo.GetAllAsync());

        [HttpGet("{identifier}")]
        public async Task<IActionResult> GetByIdOrUsername(string identifier)
        {
            User? user;
            
            if (ObjectId.TryParse(identifier, out _))
            {
                user = await _repo.GetByIdAsync(identifier);
            }
            else
            {
                user = await _repo.GetByUsernameAsync(identifier);
            }

            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            var existingUser = await _repo.GetByEmailAsync(user.Email);
            if (existingUser != null)
                return BadRequest("Email already exists");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            var created = await _repo.CreateAsync(user);
            return Ok(created);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _repo.GetByEmailAsync(request.Email);
            if (user == null)
                return Unauthorized("Invalid email or password");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password");

            if (user.Email == "admin@solario.com" && user.Role != "Admin")
            {
                user.Role = "Admin";
                await _repo.UpdateAsync(user.Id!, user);
                Console.WriteLine($"Forced Admin role for user {user.Email}");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token, user });
        }

        [Authorize]
        [HttpPost("equip/{userId}/{itemId}")]
        public async Task<IActionResult> EquipSkin(string userId, string itemId)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null) return NotFound("User not found");

            if (itemId != "default" && !user.Inventory.Contains(itemId))
            {
                return BadRequest("You do not own this skin.");
            }

            user.EquippedSkin = itemId;
            await _repo.UpdateAsync(userId, user);

            _simulationService.UpdatePlayerSkin(userId, itemId);

            return Ok(new { message = "Skin equipped", equippedSkin = itemId });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] User user)
        {
            var updated = await _repo.UpdateAsync(id, user);
            if (!updated) return NotFound();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _repo.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        private string GenerateJwtToken(User user)
        {
            var keyString = _configuration["Jwt:Key"];
            
            if (string.IsNullOrEmpty(keyString))
            {
                keyString = Environment.GetEnvironmentVariable("JWT_KEY");
            }

            if (string.IsNullOrEmpty(keyString) || keyString.Length < 32)
            {
                keyString = "super_dlugi_sekretny_klucz_ktory_ma_32_znaki_!"; 
            }

            var key = Encoding.UTF8.GetBytes(keyString);
            
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id!),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _configuration["Jwt:Issuer"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "solario",
                Audience = _configuration["Jwt:Audience"] ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "solario_frontend",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}