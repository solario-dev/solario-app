using Microsoft.AspNetCore.Mvc;
using Solario.Services;
using Solario.Dto;

namespace Solario.Controllers
{
    [ApiController]
    [Route("api/users/{userId}/stats")]
    public class UserStatsController : ControllerBase
    {
        private readonly UserStatsService _stats;

        public UserStatsController(UserStatsService stats)
        {
            _stats = stats;
        }

        // GET api/users/{userId}/stats
        [HttpGet]
        public async Task<IActionResult> GetStats(string userId)
        {
            var stats = await _stats.GetStatsAsync(userId);
            if (stats == null)
                return NotFound("User not found");

            return Ok(stats);
        }

        // POST api/users/{userId}/stats/apply
        [HttpPost("apply")]
        public async Task<IActionResult> ApplyStats(
            string userId,
            [FromBody] UserStatsDeltaDto delta)
        {
            await _stats.ApplyDeltaAsync(userId, delta);
            return Ok();
        }
    }
}
