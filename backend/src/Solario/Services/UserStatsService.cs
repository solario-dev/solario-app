using Solario.Repository;
using Solario.Dto;
using Solario.Models;
using Microsoft.Extensions.Logging;

namespace Solario.Services
{
    public class UserStatsService
    {
        private readonly UserRepository _repo;
        private readonly ILogger<UserStatsService> _logger;

        public UserStatsService(
            UserRepository repo,
            ILogger<UserStatsService> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        public async Task ApplyDeltaAsync(string userId, UserStatsDeltaDto delta)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            user.TotalScore += delta.TotalScoreDelta;
            user.QuestionsAnswered += delta.QuestionsAnsweredDelta;
            user.CorrectAnswers += delta.CorrectAnswersDelta;
            user.DistanceTraveled += delta.DistanceTraveledDelta;
            user.QuizzesCompleted += delta.QuizzesCompletedDelta;

            foreach (var planet in delta.NewVisitedPlanets)
            {
                if (!user.PlanetsVisited.Contains(planet))
                {
                    user.PlanetsVisited.Add(planet);
                }
            }

            await _repo.UpdateAsync(userId, user);

            _logger.LogInformation(
                "Updated stats for user {UserId} (+{Score} pts)",
                userId,
                delta.TotalScoreDelta
            );
        }

        public async Task<UserStatsDto?> GetStatsAsync(string userId)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null)
                return null;

            return new UserStatsDto
            {
                UserId = user.Id!,
                TotalScore = user.TotalScore,
                QuestionsAnswered = user.QuestionsAnswered,
                CorrectAnswers = user.CorrectAnswers,
                QuizzesCompleted = user.QuizzesCompleted,
                DistanceTraveled = user.DistanceTraveled,
                PlanetsVisited = user.PlanetsVisited
            };
        }
    }
}
