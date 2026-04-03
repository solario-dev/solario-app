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

    [Fact]
    public void Turn_UpdatesRotationCorrectly()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");

        player.Turn(90f);

        player.Rotation.Should().Be(90f);
    }

    [Fact]
    public void Turn_WrapsAroundWhenNegative()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");

        player.Turn(-90f);

        player.Rotation.Should().Be(270f);
    }

    [Fact]
    public void LeaveOrbit_ChangesStateToExplorationAndClearsOrbit()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");
        player.EnterOrbit("Mars");

        player.LeaveOrbit();

        player.State.Should().Be(PlayerState.Exploration);
        player.Orbit.Should().BeNull();
    }

    [Fact]
    public void Disconnect_ChangesStateToDisconnected()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");

        player.Disconnect();

        player.State.Should().Be(PlayerState.Disconnected);
    }

    [Fact]
    public void RegisterAnswer_CorrectAnswer_IncreasesScoreAndCounts()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");

        player.RegisterAnswer(true, 150);

        player.QuestionsAnswered.Should().Be(1);
        player.CorrectAnswers.Should().Be(1);
        player.Points.Should().Be(150);
    }

    [Fact]
    public void RegisterAnswer_WrongAnswer_IncreasesOnlyQuestionsAnswered()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");

        player.RegisterAnswer(false, 0);

        player.QuestionsAnswered.Should().Be(1);
        player.CorrectAnswers.Should().Be(0);
        player.Points.Should().Be(0);
    }

    [Fact]
    public void PerformMovement_TurnLeft_UpdatesRotation()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");
        player.SetTurnLeft(true);

        player.PerformMovement(0.1f);

        player.Rotation.Should().Be(36f);
    }

    [Fact]
    public void PerformMovement_TurnRight_UpdatesRotation()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");
        player.SetTurnRight(true);

        player.PerformMovement(0.1f);

        player.Rotation.Should().Be(324f);
    }

    [Fact]
    public void PerformMovement_Turbo_IncreasesSpeed()
    {
        var player = new Player("1", 0f, 0f, 0f, 0f, 10f, "default");
        player.SetTurbo(true);
        player.SetMoveForward(true);

        player.PerformMovement(1f);

        player.DistanceTraveled.Should().Be(50f);
    }
}