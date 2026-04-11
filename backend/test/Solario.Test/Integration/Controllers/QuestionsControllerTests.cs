using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Solario.Dto;
using Solario.Models;

namespace Solario.Test.Integration.Controllers;

public class QuestionsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public QuestionsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task AuthenticateAsAdminAsync()
    {
        var email = $"admin_{Guid.NewGuid()}@solario.com";
        var newUser = new User 
        { 
            Username = "AdminUser", 
            Email = email, 
            PasswordHash = "admin123", 
            Role = "Admin" 
        };
        await _client.PostAsJsonAsync("/api/Users/register", newUser);
        
        var loginResponse = await _client.PostAsJsonAsync("/api/Users/login", new LoginRequest 
        { 
            Email = email, 
            Password = "admin123" 
        });
        
        var loginData = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var token = loginData.GetProperty("token").GetString();
        
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
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

    [Fact]
    public async Task Create_AsAdmin_ReturnsOkAndCreatesQuestion()
    {
        await AuthenticateAsAdminAsync();

        var request = new CreateQuestionRequest
        {
            PlanetName = "earth",
            Text = "Test Create",
            Answers = new List<CreateAnswerRequest>
            {
                new CreateAnswerRequest { Text = "A" },
                new CreateAnswerRequest { Text = "B" }
            },
            CorrectAnswerIndex = 0
        };

        var response = await _client.PostAsJsonAsync("/api/questions", request);
        
        response.EnsureSuccessStatusCode();
        var created = await response.Content.ReadFromJsonAsync<QuestionDto>();
        created.Should().NotBeNull();
        created!.Text.Should().Be("Test Create");
    }

    [Fact]
    public async Task UpdateAndDelete_AsAdmin_ModifiesAndRemovesQuestion()
    {
        await AuthenticateAsAdminAsync();

        var createReq = new CreateQuestionRequest
        {
            PlanetName = "venus",
            Text = "To Delete",
            Answers = new List<CreateAnswerRequest>
            {
                new CreateAnswerRequest { Text = "A" },
                new CreateAnswerRequest { Text = "B" }
            },
            CorrectAnswerIndex = 0
        };

        var createResp = await _client.PostAsJsonAsync("/api/questions", createReq);
        var created = await createResp.Content.ReadFromJsonAsync<QuestionDto>();

        var updateReq = new UpdateQuestionRequest
        {
            PlanetName = "venus",
            Text = "Updated Text",
            Answers = new List<CreateAnswerRequest>
            {
                new CreateAnswerRequest { Text = "A-Updated" },
                new CreateAnswerRequest { Text = "B-Updated" }
            },
            CorrectAnswerIndex = 1
        };

        var updateResp = await _client.PutAsJsonAsync($"/api/questions/{created!.Id}", updateReq);
        updateResp.EnsureSuccessStatusCode();

        var deleteResp = await _client.DeleteAsync($"/api/questions/{created.Id}");
        deleteResp.EnsureSuccessStatusCode();
    }
}