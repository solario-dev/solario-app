using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Solario.Models
{
    public class ShopItem
    {
        [BsonId]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

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