namespace Solario.Services;

using Solario.Abstractions;
using System.Text.Json;
using Solario.Models;

public class SimulationService
{
    private readonly object _lock = new();
    private readonly List<Planet> _planets = new();
    private readonly Dictionary<int, Player> _players = new();

    private Thread? _thread;
    private bool _running = false;
    private float _dt = 1f / 30f;

    public float OrbitScale { get; set; } = 1.0f;
    public float PlanetScale { get; set; } = 1.0f;
    public float SimSpeed { get; set; } = 1.0f;

    // ----------------------------
    // PLANETS
    // ----------------------------
    public void InitPlanet(string name, float orbitDiameter, float yearLength, float dayLength, float planetDiameter)
    {
        lock (_lock)
        {
            _planets.Add(new Planet(
                name,
                orbitDiameter * OrbitScale,
                yearLength,
                dayLength,
                planetDiameter * PlanetScale
            ));
        }
    }

    public List<Planet> GetPlanetsSnapshot()
    {
        lock (_lock)
        {
            return new List<Planet>(_planets);
        }
    }

    public string GetPlanetsJson()
    {
        lock (_lock)
        {
            return JsonSerializer.Serialize(_planets, new JsonSerializerOptions { WriteIndented = true });
        }
    }

    // ----------------------------
    // PLAYERS
    // ----------------------------
    public void InitPlayer(int id, float x, float y, float z, float rotation, float speed)
    {
        lock (_lock)
        {
            if (!_players.ContainsKey(id))
                _players[id] = new Player(id, x, y, z, rotation, speed);
        }
    }

    public bool UpdatePlayerRotation(int id, float newRotation)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(id, out var p))
            {
                p.Turn(newRotation);
                return true;
            }
            return false;
        }
    }

    public bool UpdatePlayerSpeed(int id, float newSpeed)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(id, out var p))
            {
                typeof(Player)
                    .GetProperty(nameof(Player.Speed))?
                    .SetValue(p, newSpeed);

                return true;
            }
            return false;
        }
    }

    public bool RemovePlayer(int id)
    {
        lock (_lock)
        {
            return _players.Remove(id);
        }
    }

    public List<Player> GetPlayersSnapshot()
    {
        lock (_lock)
        {
            return _players.Values
                .Select(p => new Player(p.Id, p.PosX, p.PosY, p.PosZ, p.Rotation, p.Speed))
                .ToList();
        }
    }

    public string GetPlayersJson()
    {
        lock (_lock)
        {
            return JsonSerializer.Serialize(_players.Values, new JsonSerializerOptions { WriteIndented = true });
        }
    }

    // ----------------------------
    // FULL STATE JSON (bez nazw planet)
    // ----------------------------
    public string GetFullStateJson(int selfPlayerId)
    {
        lock (_lock)
        {
            var self = _players.TryGetValue(selfPlayerId, out var sp) ? sp : null;

            var jsonObj = new
            {
                type = "state",
                self = self == null ? null : new
                {
                    playerId = self.Id,
                    x = self.PosX,
                    y = self.PosY,
                    z = self.PosZ,
                    rot = self.Rotation
                },
                others = _players.Values
                    .Where(p => p.Id != selfPlayerId)
                    .Select(p => new
                    {
                        playerId = p.Id,
                        x = p.PosX,
                        y = p.PosY,
                        z = p.PosZ,
                        rot = p.Rotation
                    }).ToList(),
                bodies = _planets.Select(p => new
                {
                    name = p.Name,
                    x = p.PosX,
                    y = p.PosY,
                    z = 0
                }).ToList()
            };

            return JsonSerializer.Serialize(jsonObj, new JsonSerializerOptions { WriteIndented = true });
        }
    }

    // ----------------------------
    // APPLY PLAYER INPUT
    // ----------------------------
    public void ApplyPlayerInput(int playerId, PlayerInput input)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(playerId, out var player))
            {
                float turnAngle = 5f; // stopnie na tick
                if (input.Keys.Left) player.Turn(player.Rotation - turnAngle);
                if (input.Keys.Right) player.Turn(player.Rotation + turnAngle);

                // forward/backward tylko ustawiają flagi do ruchu w RunLoop
                if (input.Keys.Forward) player.SetMoveForward(true);
                if (input.Keys.Backward) player.SetMoveBackward(true);
            }
        }
    }

    // ----------------------------
    // SIMULATION LOOP
    // ----------------------------
    public void Start()
    {
        if (_running) return;
        _running = true;
        _thread = new Thread(RunLoop) { IsBackground = true };
        _thread.Start();
    }

    public void Stop()
    {
        _running = false;
        _thread?.Join();
    }

    private void RunLoop()
    {
        while (_running)
        {
            lock (_lock)
            {
                foreach (var p in _planets)
                    p.Move(_dt * SimSpeed);

                foreach (var player in _players.Values)
                    player.PerformMovement(); // ruch gracza raz na tick
            }

            Thread.Sleep((int)(_dt * 1000));
        }
    }
}
