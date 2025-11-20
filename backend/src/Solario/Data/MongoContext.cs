using MongoDB.Driver;
using Solario.Configuration;
using Solario.Models;

namespace Solario.Data
{
    public class MongoContext
    {
        private readonly IMongoDatabase _db;

        public MongoContext(MongoDbSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            _db = client.GetDatabase(settings.Database);
        }

        public IMongoCollection<User> Users => _db.GetCollection<User>("users");
    }
}