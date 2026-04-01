using Solario.Abstractions;

namespace Solario.Test.Unit.Models;

public class PlayerTests
{
    [Fact]
    public void PerformMovement_UpdatesPositionWhenMovingForward()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");
        player.SetMoveForward(true);

        player.PerformMovement(1f);

        player.DistanceTraveled.Should().Be(10f);
        player.PosZ.Should().Be(10f);
        player.PosX.Should().Be(0f);
    }

    [Fact]
    public void EnterOrbit_ChangesStateToQuizAndSetsOrbit()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");

        player.EnterOrbit("Mars");

        player.State.Should().Be(PlayerState.Quiz);
        player.Orbit.Should().Be("Mars");
        player.VisitedPlanets.Should().Contain("Mars");
    }
}