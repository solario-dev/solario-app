using Microsoft.AspNetCore.Mvc;
using Solario.Models;
using Solario.Repository;
using BCrypt.Net;
using MongoDB.Bson;


namespace Solario.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserRepository _repo;

        public UsersController(UserRepository repo)
        {
            _repo = repo;
        }

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
            // hash password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            var created = await _repo.CreateAsync(user);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] User user)
        {
            var updated = await _repo.UpdateAsync(id, user);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _repo.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}