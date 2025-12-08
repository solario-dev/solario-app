using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Solario.Models
{
    public class ShopItem
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; } = null!;

        [BsonElement("description")]
        public string Description { get; set; } = "";

        [BsonElement("price")]
        public int Price { get; set; }

        [BsonElement("imageUrl")]
        public string ImageUrl { get; set; } = "";

        [BsonElement("type")]
        public string Type { get; set; } = "cosmetic";
    }
}