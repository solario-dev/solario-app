namespace Solario.Services;

using Solario.Abstractions;
using Solario.Dto;
using Solario.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;

public class SimulationService
{
    private readonly ILogger<SimulationService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    private readonly object _lock = new();
    private readonly List<Planet> _planets = new();
    private readonly Dictionary<string, Player> _players = new();
    private readonly Dictionary<string, string> _playerSkins = new();

    private Thread? _thread;
    private bool _running = false;
    private readonly float _dt = 1f / 30f;

    public float SimSpeed { get; set; } = 1.0f;
    public float OrbitScale { get; set; } = 1.0f;
    public float PlanetScale { get; set; } = 1.0f;

    public SimulationService(
        ILogger<SimulationService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    // =============================
    // PLANETS
    // =============================
    public void InitPlanet(
        string name,
        float orbitDiameter,
        float yearLength,
        float dayLength,
        float planetDiameter)
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

    // =============================
    // PLAYERS
    // =============================
    public void InitPlayer(
        string id,
        float x,
        float y,
        float z,
        float rotation,
        float speed,
        string skin = "default")
    {
        lock (_lock)
        {
            if (!_players.ContainsKey(id))
            {
                _players[id] = new Player(id, x, y, z, rotation, speed, skin);
                _playerSkins[id] = skin;

                if (id != "0")
                {
                    Task.Run(async () =>
                    {
                        try
                        {
                            using (var scope = _scopeFactory.CreateScope())
                            {
                                var repo = scope.ServiceProvider.GetRequiredService<UserRepository>();
                                var user = await repo.GetByIdAsync(id);
                                if (user != null && !string.IsNullOrEmpty(user.EquippedSkin))
                                {
                                    UpdatePlayerSkin(id, user.EquippedSkin);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Failed to fetch skin for user {id}");
                        }
                    });
                }
            }
        }
    }

    public void UpdatePlayerSkin(string id, string skin)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(id, out var player))
            {
                _players[id] = new Player(
                    id, 
                    existing.PosX, 
                    existing.PosY, 
                    existing.PosZ, 
                    existing.Rotation, 
                    existing.Speed, 
                    skin 
                );
                _playerSkins[id] = skin;
            }
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

    // =============================
    // INPUT / QUIZ
    // =============================
    public void ApplyPlayerInput(string playerId, PlayerInput input)
    {
        lock (_lock)
        {
            if (!_players.TryGetValue(playerId, out var player))
                return;

            player.SetTurnLeft(input.Keys.Left);
            player.SetTurnRight(input.Keys.Right);
            player.SetMoveForward(input.Keys.Forward);
            player.SetMoveBackward(input.Keys.Backward);
            player.SetTurbo(input.Keys.Turbo);
        }
    }

    public bool EnterQuiz(string playerId, string planetName)
    {
        lock (_lock)
        {
            if (!_players.TryGetValue(playerId, out var player))
                return false;

            player.EnterOrbit(planetName);
            return true;
        }
    }

    public bool LeaveQuiz(string playerId)
    {
        lock (_lock)
        {
            if (!_players.TryGetValue(playerId, out var player))
                return false;

            player.LeaveOrbit();
            return true;
        }
    }

    // =============================
    // REMOVE PLAYER + SAVE STATS
    // =============================
    public async Task RemovePlayerAsync(string playerId)
    {
        Player? player;

        lock (_lock)
        {
            if (!_players.TryGetValue(playerId, out player))
                return;

            _players.Remove(playerId);
            _playerSkins.Remove(playerId);
        }

        await SavePlayerProgressAsync(player);
    }

    private async Task SavePlayerProgressAsync(Player player)
    {
        if (string.IsNullOrWhiteSpace(player.Id))
            return;

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var stats = scope.ServiceProvider.GetRequiredService<UserStatsService>();

            var delta = new UserStatsDeltaDto
            {
                TotalScoreDelta = player.Points,
                QuestionsAnsweredDelta = player.QuestionsAnswered,
                CorrectAnswersDelta = player.CorrectAnswers,
                DistanceTraveledDelta = (int)player.DistanceTraveled,
                QuizzesCompletedDelta = player.QuestionsAnswered > 0 ? 1 : 0,
                NewVisitedPlanets = player.VisitedPlanets.ToList()
            };

            await stats.ApplyDeltaAsync(player.Id, delta);

            _logger.LogInformation(
                "Player {PlayerId} stats flushed (+{Score} pts)",
                player.Id,
                player.Points
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save stats for player {PlayerId}", player.Id);
        }
    }

    // =============================
    // STATE JSON
    // =============================
    public string GetFullStateJson(string selfPlayerId)
    {
        lock (_lock)
        {
            var self = _players.TryGetValue(selfPlayerId, out var sp) ? sp : null;

            var json = new
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
                    }),
                bodies = _planets.Select(p => new
                {
                    name = p.Name,
                    x = p.PosX,
                    z = p.PosZ
                })
            };

            return JsonSerializer.Serialize(json);
        }
    }

    // =============================
    // SIMULATION LOOP
    // =============================
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
                        if (player.State == PlayerState.Quiz &&
                            player.Orbit == planet.Name)
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
}
