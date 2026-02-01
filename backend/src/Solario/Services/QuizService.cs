using Solario.Abstractions;
using Solario.Dto;
using Solario.Repository;

namespace Solario.Services;

public class QuizService
{
    private readonly QuestionRepository _questions;
    private readonly SimulationService _simulation;

    public QuizService(
        QuestionRepository questions,
        SimulationService simulation)
    {
        _questions = questions;
        _simulation = simulation;
    }

    public async Task<List<QuestionDto>> GetQuestionsAsync(
        string playerId,
        string planet,
        int count)
    {
        var player = _simulation.GetPlayer(playerId);
        if (player == null || player.State != PlayerState.Quiz)
            throw new InvalidOperationException("Player is not in quiz state.");

        var questions =
            await _questions.GetRandomByPlanetAsync(planet, count);

        var rng = new Random();

        return questions.Select(q => new QuestionDto
        {
            Id = q.Id,
            Text = q.Text,
            Answers = q.Answers
                .OrderBy(x => rng.Next()) 
                .Select(a => new AnswerDto
                {
                    Id = a.Id,
                    Text = a.Text
                }).ToList()
        }).ToList();
    }

    public async Task<bool> CheckAnswerAsync(
        string playerId,
        Guid questionId,
        Guid answerId,
        double remainingRatio)
    {
        Console.WriteLine($"Checking answer. Q: {questionId}, A: {answerId}");

        var player = _simulation.GetPlayer(playerId);
        if (player == null || player.State != PlayerState.Quiz)
            Console.WriteLine("Warning: Player not in Quiz state (Training mode?)");

        var correctId =
            await _questions.GetCorrectAnswerIdAsync(questionId);

        Console.WriteLine($"Correct ID from DB: {correctId}");

        bool isCorrect = correctId == answerId;

        int points = 0;
        if (isCorrect)
        {
            points = 100 + (int)(1000 * remainingRatio);
        }

        if (player != null)
        {
            player.RegisterAnswer(isCorrect, points);
        }
        
        return isCorrect;
    }

    public async Task HandleTimeoutAsync(string playerId, Guid questionId)
    {
        var player = _simulation.GetPlayer(playerId);
        if (player == null || player.State != PlayerState.Quiz)
            return;

        player.RegisterAnswer(false, 0);
        await Task.CompletedTask;
    }
}