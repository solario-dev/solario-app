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

        [HttpGet]
        public async Task<IActionResult> GetByPlanet(
            [FromQuery] string planet,
            [FromQuery] int count = 5)
        {
            if (string.IsNullOrWhiteSpace(planet))
                return BadRequest("Planet name is required.");

            var entities = await _repo.GetRandomByPlanetAsync(
                    planet.Trim().ToLowerInvariant(),
                    count);
            
            var dtos = entities.Select(q => new QuestionDto 
            {
                Id = q.Id,
                Text = q.Text,
                Answers = q.Answers
                    .OrderBy(_ => Guid.NewGuid())
                    .Select(a => new AnswerDto { Id = a.Id, Text = a.Text }).ToList()
            });

            return Ok(dtos);
        }

        [HttpPost("{id:guid}/answer")]
        public async Task<IActionResult> Answer(
            Guid id,
            [FromQuery] string playerId,
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

        [HttpPost("{id:guid}/timeout")]
        public async Task<IActionResult> Timeout(
            Guid id,
            [FromQuery] string playerId)
        {
            await _service.HandleTimeoutAsync(playerId, id);
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateQuestionRequest request)
        {
            try
            {
                var question = await _service.CreateQuestionAsync(request);

                var questionDto = new QuestionDto
                {
                    Id = question.Id,
                    Text = question.Text,
                    Answers = question.Answers.Select(a => new AnswerDto 
                    { 
                        Id = a.Id, 
                        Text = a.Text 
                    }).ToList()
                };

                return CreatedAtAction(
                    nameof(GetByPlanet), 
                    new { planet = question.PlanetName }, 
                    questionDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}