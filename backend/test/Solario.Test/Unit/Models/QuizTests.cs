using Moq;
using Solario.Dto;
using Solario.Models;
using Solario.QuizLogic;

namespace Solario.Test.Unit.Models;

public class QuizTests
{
    [Fact]
    public async Task StartAsync_FetchesQuestionsAndResetsIndex()
    {
        var mockApi = new Mock<IQuizApiClient>();
        mockApi.Setup(x => x.GetQuestionsAsync("Mars", 5))
               .ReturnsAsync(new List<QuestionDto>
               {
                   new QuestionDto { Id = Guid.NewGuid() },
                   new QuestionDto { Id = Guid.NewGuid() }
               });

        var quiz = new Quiz(Guid.NewGuid(), "Mars", 5, TimeSpan.FromSeconds(10));

        await quiz.StartAsync(mockApi.Object);

        quiz.Questions.Should().HaveCount(2);
        quiz.CurrentQuestionIndex.Should().Be(0);
        quiz.IsFinished.Should().BeFalse();
    }

    [Fact]
    public async Task SubmitAnswerAsync_CorrectAnswer_IncreasesScore()
    {
        var mockApi = new Mock<IQuizApiClient>();
        var questionId = Guid.NewGuid();
        var answerId = Guid.NewGuid();
        
        mockApi.Setup(x => x.GetQuestionsAsync("Earth", 1))
               .ReturnsAsync(new List<QuestionDto> { new QuestionDto { Id = questionId } });
        mockApi.Setup(x => x.CheckAnswerAsync(questionId, answerId)).ReturnsAsync(true);

        var quiz = new Quiz(Guid.NewGuid(), "Earth", 1, TimeSpan.FromSeconds(30));
        await quiz.StartAsync(mockApi.Object);
        quiz.GetCurrentQuestion();

        var result = await quiz.SubmitAnswerAsync(mockApi.Object, answerId);

        result.Should().Be(AnswerResult.Correct);
        quiz.Score.Should().BeGreaterThan(0);
        quiz.IsFinished.Should().BeTrue();
    }

    [Fact]
    public void GetCurrentQuestion_ThrowsException_WhenQuizIsFinished()
    {
        var quiz = new Quiz(Guid.NewGuid(), "Venus", 0, TimeSpan.FromSeconds(10));
        
        Action act = () => quiz.GetCurrentQuestion();

        act.Should().Throw<InvalidOperationException>();
    }
}