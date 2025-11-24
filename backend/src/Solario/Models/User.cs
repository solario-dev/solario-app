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

        [BsonElement("level")]
        public int Level { get; set; } = 1;

        [BsonElement("quizzesCompleted")]
        public int QuizzesCompleted { get; set; } = 0;

        [BsonElement("wins")]
        public int Wins { get; set; } = 0;

        [BsonElement("conqueredPlanets")]
        public string[] ConqueredPlanets { get; set; } = Array.Empty<string>();
    }
}