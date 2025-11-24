namespace Solario.Abstractions;

using System;

public class Planet
{
    private static readonly Random _rng = new Random();

    public string Name { get; private set; }
    public float OrbitDiameter { get; private set; }
    public float YearLength { get; private set; }
    public float DayLength { get; private set; }
    public float PlanetDiameter { get; private set; }
    public bool Claimed { get; private set; }

    public float PosX { get; private set; }
    public float PosY { get; private set; }

    private float _orbitalAngle;
    private float _rotationAngle;
    private readonly float _radius;

    public Planet(string name, float orbitDiameter, float yearLength, float dayLength, float planetDiameter, bool claimed = false)
    {
        if (yearLength == 0f) throw new ArgumentException("yearLength nie może być 0.");
        if (dayLength == 0f) throw new ArgumentException("dayLength nie może być 0.");

        Name = name;
        OrbitDiameter = orbitDiameter;
        YearLength = yearLength;
        DayLength = dayLength;
        PlanetDiameter = planetDiameter;
        Claimed = claimed;

        _radius = OrbitDiameter / 2f;
        _orbitalAngle = (float)(_rng.NextDouble() * Math.PI * 2.0);
        _rotationAngle = (float)(_rng.NextDouble() * Math.PI * 2.0);

        UpdatePositionFromAngle();
    }

    public void Move(float dt)
    {
        if (dt <= 0f) return;

        float orbitalAngularSpeed = (float)(2.0 * Math.PI) / YearLength;
        float rotationAngularSpeed = (float)(2.0 * Math.PI) / DayLength;

        _orbitalAngle += orbitalAngularSpeed * dt;
        _rotationAngle += rotationAngularSpeed * dt;

        _orbitalAngle = NormalizeAngle(_orbitalAngle);
        _rotationAngle = NormalizeAngle(_rotationAngle);

        UpdatePositionFromAngle();
    }

    public void Claim()
    {
        Claimed = true;
    }

    private static float NormalizeAngle(float a)
    {
        float twoPi = (float)(2.0 * Math.PI);
        a %= twoPi;
        if (a < 0) a += twoPi;
        return a;
    }

    private void UpdatePositionFromAngle()
    {
        PosX = _radius * (float)Math.Cos(_orbitalAngle);
        PosY = _radius * (float)Math.Sin(_orbitalAngle);
    }
}