using MongoDB.Driver;
using Solario.Data;
using Solario.Models;

namespace Solario.Repository
{
    public class ShopRepository
    {
        private readonly MongoContext _context;

        public ShopRepository(MongoContext context)
        {
            _context = context;
        }

        public async Task<List<ShopItem>> GetAllAsync() =>
            await _context.ShopItems.Find(_ => true).ToListAsync();

        public async Task<ShopItem?> GetByIdAsync(string id) =>
            await _context.ShopItems.Find(i => i.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(ShopItem item) =>
            await _context.ShopItems.InsertOneAsync(item);

        public async Task<bool> UpdateAsync(string id, ShopItem item)
        {
            var result = await _context.ShopItems.ReplaceOneAsync(i => i.Id == id, item);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _context.ShopItems.DeleteOneAsync(i => i.Id == id);
            return result.DeletedCount > 0;
        }
    }
}