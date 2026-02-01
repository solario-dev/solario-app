public interface IQuizApiClient
    {
        Task<List<QuestionDto>> GetQuestionsAsync(
            string planet,
            int count);

        Task<bool> CheckAnswerAsync(
            Guid questionId,
            Guid answerId);

        Task ReportTimeoutAsync(
            Guid questionId);
    }