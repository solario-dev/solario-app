using Microsoft.AspNetCore.Mvc;
using Solario.Services;
using Solario.Models;
using Solario.Dto;
using Solario.Repository;

namespace Solario.Controllers
{
    [ApiController]
    [Route("api/questions")]
    public class QuestionsController : ControllerBase
    {
        private readonly QuestionService _service;
        private readonly QuestionRepository _repo;

        public QuestionsController(
            QuestionRepository repo,
            QuestionService service)
        {
            _repo = repo;
            _service = service;
        }

        // =====================================
        // QUIZ: pobranie pytań
        // =====================================
        // GET: api/questions?planet=mars&count=5
        [HttpGet]
        public async Task<IActionResult> GetByPlanet(
            [FromQuery] string planet,
            [FromQuery] int count = 5)
        {
            if (string.IsNullOrWhiteSpace(planet))
                return BadRequest("Planet name is required.");

            var questions = await _repo
                .GetRandomByPlanetAsync(
                    planet.Trim().ToLowerInvariant(),
                    count);

            return Ok(questions);
        }

        // =====================================
        // QUIZ: odpowiedź
        // =====================================
        // POST: api/questions/{id}/answer?playerId=1&remainingRatio=0.73
        [HttpPost("{id:guid}/answer")]
        public async Task<IActionResult> Answer(
            Guid id,
            [FromQuery] int playerId,
            [FromQuery] double remainingRatio,
            [FromBody] AnswerRequest request)
        {
            if (request == null || request.AnswerId == Guid.Empty)
                return BadRequest("AnswerId is required.");

            var correct = await _service.CheckAnswerAsync(
                playerId,
                id,
                request.AnswerId,
                remainingRatio);

            return Ok(new { isCorrect = correct });
        }

        // =====================================
        // QUIZ: timeout
        // =====================================
        // POST: api/questions/{id}/timeout?playerId=1
        [HttpPost("{id:guid}/timeout")]
        public async Task<IActionResult> Timeout(
            Guid id,
            [FromQuery] int playerId)
        {
            await _service.HandleTimeoutAsync(playerId, id);
            return Ok();
        }

        // =====================================
        // ADMIN: dodawanie pytania
        // =====================================
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateQuestionRequest request)
        {
            try
            {
                var question =
                    await _service.CreateQuestionAsync(request);

                return CreatedAtAction(
                    nameof(Create),
                    new { id = question.Id },
                    question);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
