using Solario.Dto;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Solario.Models
{
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
}