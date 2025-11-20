using MongoDB.Driver;
using Solario.Data;
using Solario.Models;

namespace Solario.Repository
{
    public class UserRepository
    {
        private readonly MongoContext _context;

        public UserRepository(MongoContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllAsync() =>
            await _context.Users.Find(u => true).ToListAsync();

        public async Task<User?> GetByIdAsync(string id) =>
            await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();

        public async Task<User> CreateAsync(User user)
        {
            await _context.Users.InsertOneAsync(user);
            return user;
        }

        public async Task<bool> UpdateAsync(string id, User updatedUser)
        {
            var result = await _context.Users.ReplaceOneAsync(u => u.Id == id, updatedUser);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _context.Users.DeleteOneAsync(u => u.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<User?> GetByEmailAsync(string email) =>
            await _context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
    }
}