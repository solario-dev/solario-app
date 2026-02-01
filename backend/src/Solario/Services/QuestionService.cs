using Solario.Repository;
using Solario.Models;
using Solario.Abstractions;

namespace Solario.Services
{
    public class QuestionService
    {
        private readonly QuestionRepository _repo;
        private readonly SimulationService _simulation;

        public QuestionService(
            QuestionRepository repo,
            SimulationService simulation)
        {
            _repo = repo;
            _simulation = simulation;
        }

        public async Task<bool> CheckAnswerAsync(
            string playerId,
            Guid questionId,
            Guid answerId,
            double remainingRatio)
        {
            var player = _simulation.GetPlayer(playerId);
            
            if (player == null || player.State != PlayerState.Quiz)
            {
                Console.WriteLine($"[Warning] Player {playerId} CheckAnswer: State is {player?.State}, expected Quiz.");
            }

            var correctAnswerId =
                await _repo.GetCorrectAnswerIdAsync(questionId);

            if (correctAnswerId == null)
                throw new InvalidOperationException("Question not found.");

            bool isCorrect = correctAnswerId == answerId;

            int points = 0;
            if (isCorrect)
            {
                remainingRatio = Math.Clamp(remainingRatio, 0.0, 1.0);
                points = 100 + (int)(1000 * remainingRatio);
            }

            if (player != null)
            {
                player.RegisterAnswer(isCorrect, points);
            }
            
            return isCorrect;
        }

        public async Task HandleTimeoutAsync(
            string playerId,
            Guid questionId)
        {
            var player = _simulation.GetPlayer(playerId);
            if (player == null) return;

            player.RegisterAnswer(false, 0);
            await Task.CompletedTask;
        }

        public async Task<Question> CreateQuestionAsync(
            CreateQuestionRequest request)
        {
            if (request.Answers.Count < 2)
                throw new ArgumentException("Question must have at least 2 answers.");

            if (request.CorrectAnswerIndex < 0 ||
                request.CorrectAnswerIndex >= request.Answers.Count)
                throw new ArgumentException("CorrectAnswerIndex is invalid.");

            var questionId = Guid.NewGuid();

            var question = new Question
            {
                Id = questionId,
                PlanetName = request.PlanetName.Trim().ToLowerInvariant(),
                Text = request.Text
            };

            var answers = request.Answers
                .Select(a => new Answer
                {
                    Id = Guid.NewGuid(),
                    Text = a.Text,
                    QuestionId = questionId,
                    Question = question
                })
                .ToList();

            question.Answers = answers;
            question.CorrectAnswerId = answers[request.CorrectAnswerIndex].Id;

            await _repo.AddAsync(question);
            return question;
        }
    }
}