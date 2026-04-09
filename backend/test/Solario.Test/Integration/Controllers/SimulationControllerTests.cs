using System.Net.Http.Json;
using Solario.Dto;

namespace Solario.Test.Integration.Controllers;

public class SimulationControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SimulationControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetSimulationState_ReturnsOkWithValidJsonFormat()
    {
        var response = await _client.GetAsync("/simulations/state");

        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();

        content.Should().NotBeNullOrEmpty();
        content.Should().Contain("Name");
        content.Should().Contain("PosX");
        content.Should().Contain("PosZ");
    }
}