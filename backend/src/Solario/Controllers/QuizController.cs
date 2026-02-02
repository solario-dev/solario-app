using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Solario.Dto;
using Solario.Services;

namespace Solario.Controllers;

[Authorize]
[ApiController]
[Route("api/quiz")]
public class QuizController : ControllerBase
{
    private readonly QuizService _quiz;

    public QuizController(QuizService quiz)
    {
        _quiz = quiz;
    }

    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions(
        [FromQuery] string playerId,
        [FromQuery] string planet,
        [FromQuery] int count)
    {
        var result = await _quiz.GetQuestionsAsync(playerId, planet, count);
        return Ok(result);
    }

    [HttpPost("questions/{questionId:guid}/answer")]
    public async Task<IActionResult> Answer(
        Guid questionId,
        [FromQuery] string playerId,
        [FromQuery] double remainingRatio,
        [FromBody] AnswerRequest req)
    {
        var correct = await _quiz.CheckAnswerAsync(
            playerId,
            questionId,
            req.AnswerId,
            remainingRatio
        );

        return Ok(new { correct });
    }

    [HttpPost("questions/{questionId:guid}/timeout")]
    public async Task<IActionResult> Timeout(
        Guid questionId,
        [FromQuery] string playerId)
    {
        await _quiz.HandleTimeoutAsync(playerId, questionId);
        return Ok();
    }
}