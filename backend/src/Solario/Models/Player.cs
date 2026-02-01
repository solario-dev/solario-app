namespace Solario.Abstractions;

using System;
using System.Collections.Generic;

public class Player
{
    // =============================
    // IDENTITY & TRANSFORM
    // =============================
    public int Id { get; private set; }
    public float PosX { get; private set; }
    public float PosY { get; private set; }
    public float PosZ { get; private set; }
    public float Rotation { get; private set; }
    public float Speed { get; private set; }
    public float DistanceTraveled { get; private set; }
    public string Skin { get; private set; }

    // =============================
    // GAME STATE
    // =============================
    public string? Orbit { get; private set; } = null;
    public PlayerState State { get; private set; } = PlayerState.Exploration;

    public int Points { get; private set; } = 0;
    public int QuestionsAnswered { get; private set; } = 0;
    public int CorrectAnswers { get; private set; } = 0;

    public IReadOnlyCollection<string> VisitedPlanets => _visitedPlanets;
    private readonly HashSet<string> _visitedPlanets = new();

    // =============================
    // MOVEMENT FLAGS (EXPLORATION)
    // =============================
    private bool _moveForward = false;
    private bool _moveBackward = false;

    private bool _turnLeft = false;
    private bool _turnRight = false;

    private bool _turbo = false;

    // =============================
    // ORBIT MOVEMENT (QUIZ)
    // =============================
    private float _orbitDeltaX = 0f;
    private float _orbitDeltaZ = 0f;

    // =============================
    // CONSTRUCTOR
    // =============================
    public Player(
        int id,
        float x,
        float y,
        float z,
        float rotation,
        float speed,
        string skin
    )
    {
        Id = id;
        PosX = x;
        PosY = y;
        PosZ = z;
        Rotation = rotation;
        Speed = speed;
        DistanceTraveled = 0f;
        Skin = skin;
    }


    public void Turn(float newRotation)
    {
        Rotation = newRotation % 360f;
        if (Rotation < 0) Rotation += 360f;
    }

    public void SetMoveForward(bool move) => _moveForward = move;
    public void SetMoveBackward(bool move) => _moveBackward = move;
    public void SetTurnLeft(bool turn) => _turnLeft = turn;
    public void SetTurnRight(bool turn) => _turnRight = turn;
    public void SetTurbo(bool turbo) => _turbo = turbo;

    // =============================
    // ORBIT MOVEMENT – FROM SIMULATION
    // =============================
    public void ApplyOrbitMovement(float deltaX, float deltaZ)
    {
        if (State == PlayerState.Quiz)
        {
            _orbitDeltaX += deltaX;
            _orbitDeltaZ += deltaZ;
        }
    }

    // =============================
    // GAME STATE MANAGEMENT
    // =============================
    public void EnterOrbit(string planetName)
    {
        Orbit = planetName;
        _visitedPlanets.Add(planetName);
        State = PlayerState.Quiz;
    }

    public void LeaveOrbit()
    {
        Orbit = null;
        State = PlayerState.Exploration;
    }

    public void Disconnect()
    {
        State = PlayerState.Disconnected;
    }

    // =============================
    // QUIZ / SCORE
    // =============================
    public void RegisterAnswer(bool isCorrect, int pointsEarned)
    {
        QuestionsAnswered++;

        if (isCorrect)
        {
            CorrectAnswers++;
            Points += pointsEarned;
        }
    }

    // =============================
    // PERFORM MOVEMENT (ONE TICK)
    // =============================
    public void PerformMovement(float dt, float turnRate = 360f)
    {
        if (State == PlayerState.Disconnected)
            return;

        if (_turnLeft)
        {
            float turnAngle = turnRate * dt;
            Rotation = (Rotation + turnAngle) % 360f;
            if (Rotation < 0) Rotation += 360f;
        }

        if (_turnRight)
        {
            float turnAngle = turnRate * dt;
            Rotation = (Rotation - turnAngle) % 360f;
            if (Rotation < 0) Rotation += 360f;
        }

        if (State == PlayerState.Exploration)
        {
            float rad = Rotation * (float)Math.PI / 180f;
            float speedMultiplier = _turbo ? 5.0f : 1.0f;
            float effectiveSpeed = Speed * speedMultiplier;

            float dx = (float)Math.Sin(rad) * effectiveSpeed;
            float dz = (float)Math.Cos(rad) * effectiveSpeed;

            if (_moveForward)
            {
                PosX += dx;
                PosZ += dz;
                DistanceTraveled += effectiveSpeed;
            }

            if (_moveBackward)
            {
                PosX -= dx;
                PosZ -= dz;
                DistanceTraveled += effectiveSpeed;
            }
        }
        else if (State == PlayerState.Quiz)
        {
            PosX += _orbitDeltaX;
            PosZ += _orbitDeltaZ;
        }

        _moveForward = false;
        _moveBackward = false;
        _orbitDeltaX = 0f;
        _orbitDeltaZ = 0f;
    }
}