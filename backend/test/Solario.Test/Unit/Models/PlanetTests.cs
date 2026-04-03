using Solario.Abstractions;

namespace Solario.Test.Unit.Models;

public class PlanetTests
{
    [Fact]
    public void Claim_SetsClaimedToTrue()
    {
        var planet = new Planet("Ziemia", 100f, 365f, 24f, 10f, false);
        
        planet.Claim();

        planet.Claimed.Should().BeTrue();
    }

    [Fact]
    public void Move_UpdatesPositionAndReturnsDelta()
    {
        var planet = new Planet("Mars", 100f, 687f, 24.6f, 10f);
        var initialX = planet.PosX;
        var initialZ = planet.PosZ;

        planet.Move(10f);

        var (deltaX, deltaZ) = planet.GetDeltaMovement();
        
        deltaX.Should().NotBe(0);
        deltaZ.Should().NotBe(0);
        planet.PosX.Should().NotBe(initialX);
        planet.PosZ.Should().NotBe(initialZ);
    }

    [Fact]
    public void Constructor_ThrowsException_WhenYearLengthIsZero()
    {
        Action act = () => new Planet("Test", 100f, 0f, 24f, 10f);
        
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Move_WithZeroDt_DoesNotChangePosition()
    {
        var planet = new Planet("Mars", 100f, 687f, 24.6f, 10f);
        var initialX = planet.PosX;
        var initialZ = planet.PosZ;

        planet.Move(0f);

        planet.PosX.Should().Be(initialX);
        planet.PosZ.Should().Be(initialZ);
        var (deltaX, deltaZ) = planet.GetDeltaMovement();
        deltaX.Should().Be(0);
        deltaZ.Should().Be(0);
    }
}