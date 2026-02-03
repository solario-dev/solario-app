using System.Diagnostics;
using Solario.Dto;
using Solario.Models;

namespace Solario.QuizLogic
{
    public class Quiz
    {
        public Guid PlayerId { get; }
        public string PlanetName { get; }
        public int QuestionCount { get; }
        public TimeSpan TimePerQuestion { get; }

        public int CurrentQuestionIndex { get; private set; } = 0;
        public int Score { get; private set; } = 0;

        public IReadOnlyList<QuestionDto> Questions => _questions;

        private readonly List<QuestionDto> _questions = new();
        private readonly Stopwatch _timer = new();

        public Quiz(
            Guid playerId,
            string planetName,
            int questionCount,
            TimeSpan timePerQuestion)
        {
            PlayerId = playerId;
            PlanetName = planetName;
            QuestionCount = questionCount;
            TimePerQuestion = timePerQuestion;
        }

        public async Task StartAsync(IQuizApiClient api)
        {
            _questions.Clear();
            _questions.AddRange(
                await api.GetQuestionsAsync(PlanetName, QuestionCount)
            );

            CurrentQuestionIndex = 0;
        }

        public QuestionDto GetCurrentQuestion()
        {
            if (IsFinished)
                throw new InvalidOperationException("Quiz is finished.");

            _timer.Restart();
            return _questions[CurrentQuestionIndex];
        }

        public async Task<AnswerResult> SubmitAnswerAsync(
            IQuizApiClient api,
            Guid answerId)
        {
            _timer.Stop();

            var elapsed = _timer.Elapsed;

            if (elapsed >= TimePerQuestion)
            {
                return await HandleTimeoutAsync(api);
            }

            var remainingRatio = Math.Clamp(
                1.0 - (elapsed.TotalMilliseconds / TimePerQuestion.TotalMilliseconds),
                0.0,
                1.0
            );

            var question = _questions[CurrentQuestionIndex];

            var isCorrect = await api.CheckAnswerAsync(
                question.Id,
                answerId
            );

            if (isCorrect)
            {
                var points = 100 + (int)(1000 * remainingRatio);
                Score += points;

                CurrentQuestionIndex++;
                return AnswerResult.Correct;
            }

            CurrentQuestionIndex++;
            return AnswerResult.Wrong;
        }

        public async Task<AnswerResult> HandleTimeoutAsync(IQuizApiClient api)
        {
            _timer.Stop();

            var question = _questions[CurrentQuestionIndex];

            await api.ReportTimeoutAsync(question.Id);

            CurrentQuestionIndex++;
            return AnswerResult.Timeout;
        }

        public bool IsFinished =>
            CurrentQuestionIndex >= _questions.Count;
    }
}