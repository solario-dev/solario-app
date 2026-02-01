using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Solario.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("username")]
        public string Username { get; set; } = null!;

        [BsonElement("email")]
        public string Email { get; set; } = null!;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = null!;

        [BsonElement("role")]
        public string Role { get; set; } = "User";

        [BsonElement("level")]
        public int Level { get; set; } = 1;

        [BsonElement("credits")]
        public int Credits { get; set; } = 0;

        [BsonElement("quizzesCompleted")]
        public int QuizzesCompleted { get; set; } = 0;

        [BsonElement("wins")]
        public int Wins { get; set; } = 0;

        // =============================
        // QUIZ STATISTICS
        // =============================

        [BsonElement("questionsAnswered")]
        public int QuestionsAnswered { get; set; } = 0;

        [BsonElement("correctAnswers")]
        public int CorrectAnswers { get; set; } = 0;

        [BsonElement("totalScore")]
        public int TotalScore { get; set; } = 0;

        // =============================
        // EXPLORATION STATISTICS
        // =============================

        [BsonElement("distanceTraveled")]
        public float DistanceTraveled { get; set; } = 0f;

        [BsonElement("planetsVisited")]
        public List<string> PlanetsVisited { get; set; } = new();

        [BsonElement("conqueredPlanets")]
        public string[] ConqueredPlanets { get; set; } = Array.Empty<string>();

        // =============================
        // INVENTORY / COSMETICS
        // =============================

        [BsonElement("inventory")]
        public List<string> Inventory { get; set; } = new();

        [BsonElement("equippedSkin")]
        public string EquippedSkin { get; set; } = "default";
    }
}
