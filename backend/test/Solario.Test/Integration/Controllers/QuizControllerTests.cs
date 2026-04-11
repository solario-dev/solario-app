using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Solario.Dto;
using Solario.Models;
using Solario.Services;

namespace Solario.Test.Integration.Controllers;

public class QuizControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public QuizControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task AuthenticateAsync()
    {
        var email = $"user_{Guid.NewGuid()}@test.com";
        var newUser = new User 
        { 
            Username = "QuizUser", 
            Email = email, 
            PasswordHash = "pass123", 
            Role = "User" 
        };
        await _client.PostAsJsonAsync("/api/Users/register", newUser);
        
        var loginResponse = await _client.PostAsJsonAsync("/api/Users/login", new LoginRequest 
        { 
            Email = email, 
            Password = "pass123" 
        });
        
        var loginData = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var token = loginData.GetProperty("token").GetString();
        
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    [Fact]
    public async Task GetQuestions_WhenPlayerInQuizState_ReturnsQuestions()
    {
        await AuthenticateAsync();
        using var scope = _factory.Services.CreateScope();
        var simService = scope.ServiceProvider.GetRequiredService<SimulationService>();
        
        string simPlayerId = Guid.NewGuid().ToString();
        simService.InitPlayer(simPlayerId, 0, 0, 0, 0, 1, "default");
        simService.EnterQuiz(simPlayerId, "mars");

        var response = await _client.GetAsync($"/api/quiz/questions?playerId={simPlayerId}&planet=mars&count=2");

        response.EnsureSuccessStatusCode();
        var questions = await response.Content.ReadFromJsonAsync<List<QuestionDto>>();
        questions.Should().NotBeNull();
    }

    [Fact]
    public async Task Answer_ValidRequest_ReturnsCorrectStatus()
    {
        await AuthenticateAsync();
        using var scope = _factory.Services.CreateScope();
        var simService = scope.ServiceProvider.GetRequiredService<SimulationService>();
        
        string simPlayerId = Guid.NewGuid().ToString();
        simService.InitPlayer(simPlayerId, 0, 0, 0, 0, 1, "default");
        simService.EnterQuiz(simPlayerId, "mars");

        var req = new AnswerRequest 
        { 
            AnswerId = Guid.NewGuid(), 
            RemainingRatio = 0.5 
        };
        
        var response = await _client.PostAsJsonAsync($"/api/quiz/questions/{Guid.NewGuid()}/answer?playerId={simPlayerId}", req);

        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadAsStringAsync();
        result.Should().Contain("correct");
    }

    [Fact]
    public async Task Timeout_ValidRequest_ReturnsOk()
    {
        await AuthenticateAsync();
        using var scope = _factory.Services.CreateScope();
        var simService = scope.ServiceProvider.GetRequiredService<SimulationService>();
        
        string simPlayerId = Guid.NewGuid().ToString();
        simService.InitPlayer(simPlayerId, 0, 0, 0, 0, 1, "default");
        simService.EnterQuiz(simPlayerId, "mars");

        var response = await _client.PostAsync($"/api/quiz/questions/{Guid.NewGuid()}/timeout?playerId={simPlayerId}", null);

        response.EnsureSuccessStatusCode();
    }
}