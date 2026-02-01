namespace Solario.Services;

using Solario.Abstractions;
using System.Text.Json;
using Solario.Models;
using Microsoft.Extensions.Logging;
using Solario.Repository;
using Microsoft.Extensions.DependencyInjection;
using Solario.Services;

public class SimulationService
{
    private readonly ILogger<SimulationService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly object _lock = new();
    private readonly List<Planet> _planets = new();
    private readonly Dictionary<string, Player> _players = new();
    
    private readonly Dictionary<string, string> _playerSkins = new();

    public SimulationService(ILogger<SimulationService> logger, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    private Thread? _thread;
    private bool _running = false;
    private float _dt = 1f / 30f;

    public float SimSpeed { get; set; } = 1.0f;
    public float OrbitScale { get; set; } = 1.0f;
    public float PlanetScale { get; set; } = 1.0f;

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

    public void InitPlayer(string id, float x, float y, float z, float rotation, float speed, string skin = "default")
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

    public void UpdatePlayerSkin(string id, string skin)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(id, out var existing))
            {
                _players[id] = new Player(id, existing.PosX, existing.PosY, existing.PosZ, existing.Rotation, existing.Speed, skin);
                _playerSkins[id] = skin;
            }
        }
    }

    public async Task RemovePlayerAsync(string id)
    {
        Player? playerToRemove = null;

        lock (_lock)
        {
            if (_players.TryGetValue(id, out var player))
            {
                playerToRemove = player;
                _players.Remove(id);
            }
            _playerSkins.Remove(id);
        }

        if (playerToRemove != null)
        {
            await SavePlayerProgress(playerToRemove);
        }
    }

    private async Task SavePlayerProgress(Player player)
    {
        if (player.Id == "0") return;

        try 
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var userRepo = scope.ServiceProvider.GetRequiredService<UserRepository>();
                var user = await userRepo.GetByIdAsync(player.Id);

                if (user != null)
                {
                    user.Credits += player.Points;
                    user.QuizzesCompleted += player.QuestionsAnswered > 0 ? 1 : 0;
                    user.Level += player.Points / 1000; 

                    var currentPlanets = user.ConqueredPlanets.ToList();
                    foreach(var p in player.VisitedPlanets)
                    {
                        if (!currentPlanets.Contains(p))
                        {
                            currentPlanets.Add(p);
                        }
                    }
                    user.ConqueredPlanets = currentPlanets.ToArray();

                    await userRepo.UpdateAsync(player.Id, user);
                    _logger.LogInformation($"Saved progress for user {player.Id}. Earned {player.Points} credits.");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to save progress for user {player.Id}");
        }
    }

    public string GetFullStateJson(string selfPlayerId)
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

    public void ApplyPlayerInput(string playerId, PlayerInput input)
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

    public bool EnterQuiz(string playerId, string planetName)
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

    public bool LeaveQuiz(string playerId)
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

    public Player? GetPlayer(string playerId)
    {
        lock (_lock)
        {
            _players.TryGetValue(playerId, out var player);
            return player;
        }
    }

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
                    planet.Move(_dt * SimSpeed);

                foreach (var planet in _planets)
                {
                    var (dx, dz) = planet.GetDeltaMovement();
                    if (dx == 0f && dz == 0f) continue;

                    foreach (var player in _players.Values)
                    {
                        if (player.State == PlayerState.Quiz && player.Orbit == planet.Name)
                        {
                            player.ApplyOrbitMovement(dx, dz);
                        }
                    }
                }

                foreach (var player in _players.Values)
                    player.PerformMovement(_dt * SimSpeed);
            }
            Thread.Sleep((int)(_dt * 1000));
        }
    }
    public async Task FlushPlayerStatsAsync(Player player, string userId)
    {
        var delta = new UserStatsDeltaDto
        {
            QuestionsAnsweredDelta = player.QuestionsAnswered,
            CorrectAnswersDelta = player.CorrectAnswers,
            TotalScoreDelta = player.Points,
            DistanceTraveledDelta = player.DistanceTraveled,
            NewVisitedPlanets = player.VisitedPlanets.Length()
        };

    await _userStats.ApplyDeltaAsync(userId, delta);
    }

    public Player? GetPlayer(int playerId)
    {
        lock (_lock)
        {
            _players.TryGetValue(playerId, out var player);
            return player;
        }
    }

    public Player? RemovePlayerAndReturn(int playerId)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(playerId, out var player))
            {
                _players.Remove(playerId);
                return player;
            }
        return null;
        }
    }
}
