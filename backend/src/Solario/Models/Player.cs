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

    // Flagi do ruchu na tick
    private bool _moveForward = false;
    private bool _moveBackward = false;

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
    // FLAGI RUCHU
    // ----------------------------
    public void SetMoveForward(bool move) => _moveForward = move;
    public void SetMoveBackward(bool move) => _moveBackward = move;

    // ----------------------------
    // PERFORM MOVEMENT - jeden tick
    // ----------------------------
    public void PerformMovement()
    {
        float rad = Rotation * (float)Math.PI / 180f;

        // Ruch w płaszczyźnie XZ
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

        // PosZ pozostaje stałe
    }
}
