namespace Solario.Abstractions;

using System;

public class Player
{
    public int Id { get; private set; }
    public float PosX { get; private set; }
    public float PosY { get; private set; }
    public float PosZ { get; private set; }
    public float Rotation { get; private set; }
    public float Speed { get; private set; }
    public float DistanceTraveled { get; private set; }
    public string Skin { get; private set; }

    private bool _moveForward = false;
    private bool _moveBackward = false;
    private bool _turnLeft = false;
    private bool _turnRight = false;
    private bool _turbo = false;

    public Player(int id, float x, float y, float z, float rotation, float speed, string skin = "default")
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

    public void PerformMovement(float dt, float turnRate = 360f)
    {
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
            _moveForward = false;
        }

        if (_moveBackward)
        {
            PosX -= dx;
            PosZ -= dz;
            DistanceTraveled += effectiveSpeed;
            _moveBackward = false;
        }
    }
}