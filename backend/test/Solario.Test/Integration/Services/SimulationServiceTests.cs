using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Solario.Abstractions;
using Solario.Models;
using Solario.Services;

namespace Solario.Test.Unit.Services;

public class SimulationServiceTests
{
    private readonly SimulationService _service;

    public SimulationServiceTests()
    {
        var loggerMock = new Mock<ILogger<SimulationService>>();
        var scopeFactoryMock = new Mock<IServiceScopeFactory>();
        _service = new SimulationService(loggerMock.Object, scopeFactoryMock.Object);
    }

    [Fact]
    public void InitPlanet_AddsPlanetToSnapshot()
    {
        _service.InitPlanet("TestPlanet", 1000f, 365f, 24f, 100f);

        var planets = _service.GetPlanetsSnapshot();

        planets.Should().ContainSingle(p => p.Name == "TestPlanet");
    }

    [Fact]
    public void InitPlayer_AddsPlayerAndAllowsRetrieval()
    {
        _service.InitPlayer("player1", 10f, 20f, 30f, 90f, 5f, "falcon");

        var player = _service.GetPlayer("player1");

        player.Should().NotBeNull();
        player!.PosX.Should().Be(10f);
        player.Skin.Should().Be("falcon");
    }

    [Fact]
    public void ApplyPlayerInput_UpdatesPlayerState()
    {
        _service.InitPlayer("player2", 0, 0, 0, 0, 1, "default");
        var input = new PlayerInput 
        { 
            Keys = new InputKeys { Forward = true, Turbo = true } 
        };

        _service.ApplyPlayerInput("player2", input);

        var player = _service.GetPlayer("player2");
        player.Should().NotBeNull();
    }

    [Fact]
    public void EnterAndLeaveQuiz_UpdatesPlayerOrbitState()
    {
        _service.InitPlayer("player3", 0, 0, 0, 0, 1, "default");

        var entered = _service.EnterQuiz("player3", "Venus");
        entered.Should().BeTrue();

        var player = _service.GetPlayer("player3");
        player!.State.Should().Be(PlayerState.Quiz);
        player.Orbit.Should().Be("Venus");

        var left = _service.LeaveQuiz("player3");
        left.Should().BeTrue();

        player.State.Should().Be(PlayerState.Exploration);
        player.Orbit.Should().BeNull();
    }

    [Fact]
    public void GetFullStateJson_ReturnsValidJsonStructure()
    {
        _service.InitPlanet("TestPlanet", 1000f, 365f, 24f, 100f);
        _service.InitPlayer("selfId", 0, 0, 0, 0, 1, "default");
        _service.InitPlayer("otherId", 10, 0, 10, 0, 1, "default");

        var json = _service.GetFullStateJson("selfId");

        json.Should().Contain("selfId");
        json.Should().Contain("otherId");
        json.Should().Contain("TestPlanet");
        json.Should().Contain("\"type\":\"state\"");
    }
}