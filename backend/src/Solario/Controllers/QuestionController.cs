using Microsoft.AspNetCore.Mvc;
using Solario.Services;
using Solario.Models;
using Solario.Dto;
using Solario.Repository;
using Microsoft.AspNetCore.Authorization;

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
            [FromQuery] int count = 100)
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
                CorrectAnswerId = q.CorrectAnswerId,
                Answers = q.Answers.Select(a => new AnswerDto { Id = a.Id, Text = a.Text }).ToList()
            });

            return Ok(dtos);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateQuestionRequest request)
        {
            try
            {
                var question = await _service.CreateQuestionAsync(request);
                return Ok(MapToDto(question));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateQuestionRequest request)
        {
            try
            {
                var question = await _service.UpdateQuestionAsync(id, request);
                return Ok(MapToDto(question));
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteQuestionAsync(id);
            return NoContent();
        }

        private static QuestionDto MapToDto(Question q)
        {
            return new QuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                CorrectAnswerId = q.CorrectAnswerId,
                Answers = q.Answers.Select(a => new AnswerDto 
                { 
                    Id = a.Id, 
                    Text = a.Text 
                }).ToList()
            };
        }
    }
}