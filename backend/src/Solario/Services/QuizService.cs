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

    // =============================
    // GET QUESTIONS FOR QUIZ
    // =============================
    public async Task<List<QuestionDto>> GetQuestionsAsync(
        int playerId,
        string planet,
        int count)
    {
        var player = _simulation.GetPlayer(playerId);
        if (player == null || player.State != PlayerState.Quiz)
            throw new InvalidOperationException("Player is not in quiz state.");

        var questions =
            await _questions.GetRandomByPlanetAsync(planet, count);

        return questions.Select(q => new QuestionDto
        {
            Id = q.Id,
            Text = q.Text,
            Answers = q.Answers.Select(a => new AnswerDto
            {
                Id = a.Id,
                Text = a.Text
            }).ToList()
        }).ToList();
    }

    // =============================
    // CHECK ANSWER
    // =============================
    public async Task<bool> CheckAnswerAsync(
        int playerId,
        Guid questionId,
        Guid answerId,
        double remainingRatio)
    {
        var player = _simulation.GetPlayer(playerId);
        if (player == null || player.State != PlayerState.Quiz)
            throw new InvalidOperationException("Player is not in quiz state.");

        var correctId =
            await _questions.GetCorrectAnswerIdAsync(questionId);

        bool isCorrect = correctId == answerId;

        int points = 0;
        if (isCorrect)
        {
            points = 100 + (int)(1000 * remainingRatio);
        }

        player.RegisterAnswer(isCorrect, points);
        return isCorrect;
    }

    // =============================
    // TIMEOUT
    // =============================
    public async Task HandleTimeoutAsync(int playerId, Guid questionId)
    {
        var player = _simulation.GetPlayer(playerId);
        if (player == null || player.State != PlayerState.Quiz)
            return;

        // 0 pkt, tylko statystyki
        player.RegisterAnswer(false, 0);
        await Task.CompletedTask;
    }
}
