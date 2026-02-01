using Microsoft.AspNetCore.Mvc;
using Solario.Repository;
using Solario.Services;
using Solario.Models;

namespace Solario.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly QuestionRepository _repo;
        private readonly QuestionService _service;

        public QuestionsController(
            QuestionRepository repo,
            QuestionService service)
        {
            _repo = repo;
            _service = service;
        }

        // GET: api/questions?planet=mars
        [HttpGet]
        public async Task<IActionResult> GetByPlanet([FromQuery] string planet)
        {
            if (string.IsNullOrWhiteSpace(planet))
                return BadRequest("Planet name is required.");

            var questions = await _repo.GetByPlanetAsync(planet.Trim().ToLowerInvariant());
            return Ok(questions);
        }

        // GET: api/questions/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var question = await _repo.GetByIdAsync(id);

            if (question == null)
                return NotFound();

            return Ok(question);
        }

        // POST: api/questions/{id}/answer
        [HttpPost("{id:guid}/answer")]
        public async Task<IActionResult> CheckAnswer(
            Guid id,
            [FromBody] AnswerRequest request)
        {
            if (request == null || request.AnswerId == Guid.Empty)
                return BadRequest("AnswerId is required.");

            var result = await _service.CheckAnswerAsync(id, request.AnswerId);

            if (result == null)
                return NotFound();

            return Ok(new { isCorrect = result.Value });
        }

        // === NOWE: POST pytania z odpowiedziami ===
        // POST: api/questions
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateQuestionRequest request)
        {
            try
            {
                var question = await _service.CreateQuestionAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = question.Id }, question);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
