using System.Net;
using System.Net.Http.Json;
using Solario.Dto;

namespace Solario.Test.Integration.Controllers;

public class QuestionsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public QuestionsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetByPlanet_ReturnsOkWithQuestions()
    {
        var response = await _client.GetAsync("/api/questions?planet=mars");

        response.EnsureSuccessStatusCode();
        var questions = await response.Content.ReadFromJsonAsync<List<QuestionDto>>();

        questions.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByPlanet_MissingPlanet_ReturnsBadRequest()
    {
        var response = await _client.GetAsync("/api/questions");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}