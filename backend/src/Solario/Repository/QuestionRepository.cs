using Microsoft.EntityFrameworkCore;
using Solario.Data;
using Solario.Models;

namespace Solario.Repository
{
    public class QuestionRepository
    {
        private readonly PostgresContext _db;

        public QuestionRepository(PostgresContext db)
        {
            _db = db;
        }

        public async Task<List<Question>> GetByPlanetAsync(string planet)
        {
            return await _db.Questions
                .Where(q => q.PlanetName == planet)
                .Include(q => q.Answers)
                .ToListAsync();
        }

        public async Task<Question?> GetByIdAsync(Guid id)
        {
            return await _db.Questions
                .Include(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task<Guid?> GetCorrectAnswerIdAsync(Guid questionId)
        {
            return await _db.Questions
                .Where(q => q.Id == questionId)
                .Select(q => (Guid?)q.CorrectAnswerId)
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(Question question)
        {
                _db.Questions.Add(question);
                await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(Question question)
        {
            _db.Questions.Update(question);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Question question)
        {
            _db.Questions.Remove(question);
            await _db.SaveChangesAsync();
        }

        public async Task<List<Question>> GetRandomByPlanetAsync(
            string planet,
            int count)
        {
            return await _db.Questions
                .Include(q => q.Answers)
                .Where(q => q.PlanetName == planet)
                .OrderBy(_ => Guid.NewGuid())
                .Take(count)
                .ToListAsync();
        }
    }
}