using System.Net;
using System.Net.Http.Json;
using Solario.Dto;
using Solario.Models;

namespace Solario.Test.Integration.Controllers;

public class UserStatsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public UserStatsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetStats_NonExistentUser_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/users/000000000000000000000000/stats");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ApplyStats_ValidDelta_ReturnsOk()
    {
        var newUser = new User
        {
            Username = "StatsTestUser",
            Email = "stats@solario.com",
            PasswordHash = "hash",
            Role = "User"
        };
        
        var registerResponse = await _client.PostAsJsonAsync("/api/Users/register", newUser);
        var createdUser = await registerResponse.Content.ReadFromJsonAsync<User>();

        var delta = new UserStatsDeltaDto
        {
            TotalScoreDelta = 500,
            QuestionsAnsweredDelta = 5,
            CorrectAnswersDelta = 3,
            DistanceTraveledDelta = 1000,
            NewVisitedPlanets = new List<string> { "Mars", "Venus" },
            QuizzesCompletedDelta = 1
        };

        var applyResponse = await _client.PostAsJsonAsync($"/api/users/{createdUser!.Id}/stats/apply", delta);

        applyResponse.EnsureSuccessStatusCode();

        var getResponse = await _client.GetAsync($"/api/users/{createdUser.Id}/stats");
        var stats = await getResponse.Content.ReadFromJsonAsync<UserStatsDto>();

        stats.Should().NotBeNull();
        stats!.TotalScore.Should().Be(500);
        stats.ConqueredPlanets.Should().Contain("Mars");
    }
}