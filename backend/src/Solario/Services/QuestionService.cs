using Solario.Repository;
using Solario.Models;
using Solario.Abstractions;

namespace Solario.Services
{
    public class QuestionService
    {
        private readonly QuestionRepository _repo;

        public QuestionService(QuestionRepository repo)
        {
            _repo = repo;
        }

        public async Task<Question> CreateQuestionAsync(CreateQuestionRequest request)
        {
            if (request.Answers.Count < 2)
                throw new ArgumentException("Question must have at least 2 answers.");

            if (request.CorrectAnswerIndex < 0 ||
                request.CorrectAnswerIndex >= request.Answers.Count)
                throw new ArgumentException("CorrectAnswerIndex is invalid.");

            var questionId = Guid.NewGuid();

            var question = new Question
            {
                Id = questionId,
                PlanetName = request.PlanetName.Trim().ToLowerInvariant(),
                Text = request.Text
            };

            var answers = request.Answers
                .Select(a => new Answer
                {
                    Id = Guid.NewGuid(),
                    Text = a.Text,
                    QuestionId = questionId,
                    Question = question
                })
                .ToList();

            question.Answers = answers;
            question.CorrectAnswerId = answers[request.CorrectAnswerIndex].Id;

            await _repo.AddAsync(question);
            return question;
        }

        public async Task<Question> UpdateQuestionAsync(Guid id, UpdateQuestionRequest request)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) throw new KeyNotFoundException("Question not found");

            if (request.Answers.Count < 2)
                throw new ArgumentException("Question must have at least 2 answers.");

            existing.Text = request.Text;
            existing.PlanetName = request.PlanetName.Trim().ToLowerInvariant();

            
            int i = 0;
            while (i < existing.Answers.Count && i < request.Answers.Count)
            {
                existing.Answers[i].Text = request.Answers[i].Text;
                i++;
            }

            while (i < request.Answers.Count)
            {
                var newAns = new Answer
                {
                    Id = Guid.NewGuid(),
                    Text = request.Answers[i].Text,
                    QuestionId = existing.Id
                };
                existing.Answers.Add(newAns);
                i++;
            }

            while (existing.Answers.Count > request.Answers.Count)
            {
                existing.Answers.RemoveAt(existing.Answers.Count - 1);
            }

            if (request.CorrectAnswerIndex >= 0 && request.CorrectAnswerIndex < existing.Answers.Count)
            {
                existing.CorrectAnswerId = existing.Answers[request.CorrectAnswerIndex].Id;
            }

            await _repo.UpdateAsync(existing);
            return existing;
        }

        public async Task DeleteQuestionAsync(Guid id)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing != null)
            {
                await _repo.DeleteAsync(existing);
            }
        }
    }
}