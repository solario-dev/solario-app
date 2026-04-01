using System.Net.Http.Json;
using Solario.Abstractions;

namespace Solario.Test.Integration.Controllers;

public class PlanetControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public PlanetControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPlanets_ReturnsOkStatusAndPlanets()
    {
        var response = await _client.GetAsync("/api/Planet");

        response.EnsureSuccessStatusCode();
        var planets = await response.Content.ReadFromJsonAsync<List<Planet>>();
        
        planets.Should().NotBeNull();
    }
}