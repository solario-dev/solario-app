using Microsoft.AspNetCore.Mvc;
using Solario.Services;
using Solario.Dto;

namespace Solario.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserStatsController : ControllerBase
    {
        private readonly UserStatsService _stats;

        public UserStatsController(UserStatsService stats)
        {
            _stats = stats;
        }

        // POST: api/users/{userId}/stats/delta
        [HttpPost("{userId}/stats/delta")]
        public async Task<IActionResult> ApplyDelta(
            string userId,
            [FromBody] UserStatsDeltaDto delta)
        {
            if (delta == null)
                return BadRequest();

            var success = await _stats.ApplyDeltaAsync(userId, delta);

            if (!success)
                return NotFound("User not found");

            return Ok();
        }
    }
}
