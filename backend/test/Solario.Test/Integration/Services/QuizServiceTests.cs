using Microsoft.Extensions.DependencyInjection;
using Solario.Models;
using Solario.Services;

namespace Solario.Test.Integration.Services;

public class QuizServiceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public QuizServiceTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CheckAnswer_ReturnsCorrectBooleanAndAwardsPoints()
    {
        using var scope = _factory.Services.CreateScope();
        var quizService = scope.ServiceProvider.GetRequiredService<QuizService>();
        var questionService = scope.ServiceProvider.GetRequiredService<QuestionService>();
        var simService = scope.ServiceProvider.GetRequiredService<SimulationService>();

        var req = new CreateQuestionRequest
        {
            PlanetName = "venus",
            Text = "QuizService Test Question",
            Answers = new List<CreateAnswerRequest>
            {
                new CreateAnswerRequest { Text = "Wrong" },
                new CreateAnswerRequest { Text = "Correct" }
            },
            CorrectAnswerIndex = 1
        };
        var question = await questionService.CreateQuestionAsync(req);

        simService.InitPlayer("quiz_player", 0, 0, 0, 0, 1, "default");
        simService.EnterQuiz("quiz_player", "venus");

        var result = await quizService.CheckAnswerAsync("quiz_player", question.Id, question.Answers[1].Id, 1.0);
        
        result.Should().BeTrue();
        
        var player = simService.GetPlayer("quiz_player");
        player!.Points.Should().BeGreaterThan(0);
    }
    
    [Fact]
    public async Task HandleTimeout_RegistersWrongAnswer()
    {
        using var scope = _factory.Services.CreateScope();
        var quizService = scope.ServiceProvider.GetRequiredService<QuizService>();
        var simService = scope.ServiceProvider.GetRequiredService<SimulationService>();

        simService.InitPlayer("timeout_player", 0, 0, 0, 0, 1, "default");
        simService.EnterQuiz("timeout_player", "mars");

        await quizService.HandleTimeoutAsync("timeout_player", Guid.NewGuid());
        
        var player = simService.GetPlayer("timeout_player");
        player!.QuestionsAnswered.Should().Be(1);
        player.CorrectAnswers.Should().Be(0);
    }

    [Fact]
    public async Task GetQuestionsAsync_WhenNotInQuizState_ThrowsException()
    {
        using var scope = _factory.Services.CreateScope();
        var quizService = scope.ServiceProvider.GetRequiredService<QuizService>();
        var simService = scope.ServiceProvider.GetRequiredService<SimulationService>();

        simService.InitPlayer("explorer_player", 0, 0, 0, 0, 1, "default");

        Func<Task> act = async () => await quizService.GetQuestionsAsync("explorer_player", "mars", 5);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}