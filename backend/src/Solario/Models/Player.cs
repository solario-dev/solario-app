namespace Solario.Abstractions;

using System;

public class Player
{
    public int Id { get; private set; }
    public float PosX { get; private set; }
    public float PosY { get; private set; } // wysokość stała
    public float PosZ { get; private set; }
    public float Rotation { get; private set; } // stopnie, obrót wokół Y
    public float Speed { get; private set; }
    public float DistanceTraveled { get; private set; }

    // Flagi ruchu (resetowane po użyciu)
    private bool _moveForward = false;
    private bool _moveBackward = false;

    // Flagi skrętu (ciągłe - nie resetowane)
    private bool _turnLeft = false;
    private bool _turnRight = false;

    public Player(int id, float x, float y, float z, float rotation, float speed)
    {
        Id = id;
        PosX = x;
        PosY = y;
        PosZ = z;
        Rotation = rotation;
        Speed = speed;
        DistanceTraveled = 0f;
    }

    // ----------------------------
    // ROTATION
    // ----------------------------
    public void Turn(float newRotation)
    {
        Rotation = newRotation % 360f;
        if (Rotation < 0) Rotation += 360f;
    }

    // ----------------------------
    // FLAGI RUCHU I SKRĘTU
    // ----------------------------
    public void SetMoveForward(bool move) => _moveForward = move;
    public void SetMoveBackward(bool move) => _moveBackward = move;
    public void SetTurnLeft(bool turn) => _turnLeft = turn;
    public void SetTurnRight(bool turn) => _turnRight = turn;

    // ----------------------------
    // PERFORM MOVEMENT - jeden tick
    // ----------------------------
    public void PerformMovement(float dt, float turnRate = 360f)
    {
        // Obsługa skrętu (ciągłe - działa w każdej klatce gdy flaga aktywna)
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

        // Obsługa ruchu
        float rad = Rotation * (float)Math.PI / 180f;
        float dx = (float)Math.Sin(rad) * Speed; // forward X
        float dz = (float)Math.Cos(rad) * Speed; // forward Z

        if (_moveForward)
        {
            PosX += dx;
            PosZ += dz;
            DistanceTraveled += Speed;
            _moveForward = false; // reset flagi
        }

        if (_moveBackward)
        {
            PosX -= dx;
            PosZ -= dz;
            DistanceTraveled += Speed;
            _moveBackward = false; // reset flagi
        }
    }
}
