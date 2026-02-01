namespace Solario.Services;

using Solario.Abstractions;
using System.Text.Json;
using Solario.Models;
using Microsoft.Extensions.Logging;

public class SimulationService
{
    private readonly ILogger<SimulationService> _logger;
    private readonly object _lock = new();
    private readonly List<Planet> _planets = new();
    private readonly Dictionary<int, Player> _players = new();
    
    // Cache mapujący ID gracza na jego skórkę
    private readonly Dictionary<int, string> _playerSkins = new();

    public SimulationService(ILogger<SimulationService> logger)
    {
        _logger = logger;
    }

    private Thread? _thread;
    private bool _running = false;
    private float _dt = 1f / 30f;

    public float OrbitScale { get; set; } = 1.0f;
    public float PlanetScale { get; set; } = 1.0f;
    public float SimSpeed { get; set; } = 1.0f;

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

    public void InitPlayer(int id, float x, float y, float z, float rotation, float speed, string skin = "default")
    {
        lock (_lock)
        {
            if (!_players.ContainsKey(id))
            {
                _players[id] = new Player(id, x, y, z, rotation, speed, skin);
                _playerSkins[id] = skin;
            }
        }
    }

    // Pozwala zmienić skórkę w trakcie trwania symulacji
    public void UpdatePlayerSkin(int id, string skin)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(id, out var existing))
            {
                // Tworzymy nową instancję gracza z nowym skinem (Player jest immutable)
                _players[id] = new Player(id, existing.PosX, existing.PosY, existing.PosZ, existing.Rotation, existing.Speed, skin);
                _playerSkins[id] = skin;
            }
        }
    }

    public bool RemovePlayer(int id)
    {
        lock (_lock)
        {
            _playerSkins.Remove(id);
            return _players.Remove(id);
        }
    }

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
                    rot = self.Rotation,
                    skin = self.Skin
                },
                others = _players.Values
                    .Where(p => p.Id != selfPlayerId)
                    .Select(p => new
                    {
                        playerId = p.Id,
                        x = p.PosX,
                        y = p.PosY,
                        z = p.PosZ,
                        rot = p.Rotation,
                        skin = p.Skin
                    }).ToList(),
                bodies = _planets.Select(p => new
                {
                    name = p.Name,
                    x = p.PosX,
                    z = p.PosZ,
                    y = 0
                }).ToList()
            };

            return JsonSerializer.Serialize(jsonObj, new JsonSerializerOptions { WriteIndented = false });
        }
    }

    public void ApplyPlayerInput(int playerId, PlayerInput input)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(playerId, out var player))
            {
                player.SetTurnLeft(input.Keys.Left);
                player.SetTurnRight(input.Keys.Right);
                player.SetMoveForward(input.Keys.Forward);
                player.SetMoveBackward(input.Keys.Backward);
                player.SetTurbo(input.Keys.Turbo);
            }
        }
    }

<<<<<<< HEAD
=======
    public bool EnterQuiz(int playerId, string planetName)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(playerId, out var player))
            {
                player.EnterOrbit(planetName);
                return true;
            }
            return false;
        }
    }

    public bool LeaveQuiz(int playerId)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(playerId, out var player))
            {
                player.LeaveOrbit();
                return true;
            }
            return false;
        }
    }




    // ----------------------------
    // SIMULATION LOOP
    // ----------------------------
>>>>>>> 51cbe0e (Pytania, Update Websocketa, Podstawowa logika quizu + statek porusza się razem z planetą)
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
                foreach (var planet in _planets)
                {
                    planet.Move(_dt * SimSpeed);
                }

                foreach (var planet in _planets)
                {
                    var (dx, dz) = planet.GetDeltaMovement();

                    if (dx == 0f && dz == 0f)
                        continue;

                    foreach (var player in _players.Values)
                    {
                        if (player.State == PlayerState.Quiz &&
                        player.Orbit == planet.Name)
                        {
                        player.ApplyOrbitMovement(dx, dz);
                        }
                   }
                }

                foreach (var player in _players.Values)
<<<<<<< HEAD
                    player.PerformMovement(_dt * SimSpeed);
=======
                {
                    player.PerformMovement(_dt * SimSpeed);
                }
>>>>>>> 51cbe0e (Pytania, Update Websocketa, Podstawowa logika quizu + statek porusza się razem z planetą)
            }
            Thread.Sleep((int)(_dt * 1000));
        }
    }
<<<<<<< HEAD
}
=======

}
>>>>>>> 51cbe0e (Pytania, Update Websocketa, Podstawowa logika quizu + statek porusza się razem z planetą)
