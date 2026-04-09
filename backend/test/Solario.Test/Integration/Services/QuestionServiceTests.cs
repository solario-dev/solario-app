using Microsoft.Extensions.DependencyInjection;
using Solario.Models;
using Solario.Services;

namespace Solario.Test.Integration.Services;

public class QuestionServiceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public QuestionServiceTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateQuestionAsync_ValidData_CreatesQuestion()
    {
        using var scope = _factory.Services.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<QuestionService>();

        var request = new CreateQuestionRequest
        {
            PlanetName = "Jupiter",
            Text = "What is the largest planet?",
            Answers = new List<CreateAnswerRequest>
            {
                new CreateAnswerRequest { Text = "Earth" },
                new CreateAnswerRequest { Text = "Jupiter" },
                new CreateAnswerRequest { Text = "Mars" }
            },
            CorrectAnswerIndex = 1
        };

        var result = await service.CreateQuestionAsync(request);

        result.Should().NotBeNull();
        result.PlanetName.Should().Be("jupiter");
        result.Answers.Should().HaveCount(3);
        result.CorrectAnswerId.Should().Be(result.Answers[1].Id);
    }

    [Fact]
    public async Task CreateQuestionAsync_InvalidAnswersCount_ThrowsArgumentException()
    {
        using var scope = _factory.Services.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<QuestionService>();

        var request = new CreateQuestionRequest
        {
            PlanetName = "Venus",
            Text = "Is it hot?",
            Answers = new List<CreateAnswerRequest>
            {
                new CreateAnswerRequest { Text = "Yes" }
            },
            CorrectAnswerIndex = 0
        };

        Func<Task> act = async () => await service.CreateQuestionAsync(request);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task DeleteQuestionAsync_ExistingId_DeletesQuestion()
    {
        using var scope = _factory.Services.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<QuestionService>();

        var request = new CreateQuestionRequest
        {
            PlanetName = "Saturn",
            Text = "Does it have rings?",
            Answers = new List<CreateAnswerRequest>
            {
                new CreateAnswerRequest { Text = "Yes" },
                new CreateAnswerRequest { Text = "No" }
            },
            CorrectAnswerIndex = 0
        };

        var created = await service.CreateQuestionAsync(request);
        
        await service.DeleteQuestionAsync(created.Id);

        Func<Task> act = async () => await service.UpdateQuestionAsync(created.Id, new UpdateQuestionRequest());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}