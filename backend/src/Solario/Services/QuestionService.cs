using Solario.Repository;
using Solario.Models;

namespace Solario.Services
{
    public class QuestionService
    {
        private readonly QuestionRepository _repo;

        public QuestionService(QuestionRepository repo)
        {
            _repo = repo;
        }

        public async Task<bool?> CheckAnswerAsync(Guid questionId, Guid answerId)
        {
            var correctAnswerId = await _repo.GetCorrectAnswerIdAsync(questionId);

            if (correctAnswerId == null)
                return null;

            return correctAnswerId == answerId;
        }

        // === NOWE: tworzenie pytania z odpowiedziami ===
        public async Task<Question> CreateQuestionAsync(CreateQuestionRequest request)
        {
            if (request.Answers.Count < 2)
                throw new ArgumentException("Question must have at least 2 answers.");

            if (request.CorrectAnswerIndex < 0 ||
                request.CorrectAnswerIndex >= request.Answers.Count)
                throw new ArgumentException("CorrectAnswerIndex is invalid.");

            var question = new Question
            {
                PlanetName = request.PlanetName.Trim().ToLowerInvariant(),
                Text = request.Text
            };

            var answers = request.Answers
                .Select(a => new Answer
                {
                    Text = a.Text,
                    Question = question
                })
                .ToList();

            question.Answers = answers;
            question.CorrectAnswerId = answers[request.CorrectAnswerIndex].Id;

            await _repo.AddAsync(question);

            return question;
        }
    }
}
