using MongoDB.Driver;
using Solario.Models;
using Solario.Dto;

namespace Solario.Services
{
    public class UserStatsService
    {
        private readonly IMongoCollection<User> _users;

        public UserStatsService(IMongoDatabase database)
        {
            _users = database.GetCollection<User>("Users");
        }

        public async Task<bool> ApplyDeltaAsync(
            string userId,
            UserStatsDeltaDto delta)
        {
            var updates = new List<UpdateDefinition<User>>();

            if (delta.QuestionsAnsweredDelta != 0)
                updates.Add(Builders<User>.Update
                    .Inc(u => u.QuestionsAnswered, delta.QuestionsAnsweredDelta));

            if (delta.CorrectAnswersDelta != 0)
                updates.Add(Builders<User>.Update
                    .Inc(u => u.CorrectAnswers, delta.CorrectAnswersDelta));

            if (delta.TotalScoreDelta != 0)
                updates.Add(Builders<User>.Update
                    .Inc(u => u.TotalScore, delta.TotalScoreDelta));

            if (delta.DistanceTraveledDelta != 0)
                updates.Add(Builders<User>.Update
                    .Inc(u => u.DistanceTraveled, delta.DistanceTraveledDelta));

            if (delta.NewVisitedPlanets.Any())
                updates.Add(Builders<User>.Update
                    .Inc(u => u.PlanetsVisited, delta.NewVisitedPlanets));

            if (!updates.Any())
                return true; // nic do zrobienia

            var update = Builders<User>.Update.Combine(updates);

            var result = await _users.UpdateOneAsync(
                u => u.Id == userId,
                update
            );

            return result.MatchedCount > 0;
        }
    }
}
