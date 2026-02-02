namespace Solario.Services;

using Solario.Abstractions;
using Solario.Models;
using Solario.Repository;
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
        string playerId,
        float x,
        float y,
        float z,
        float rotation,
        float speed,
        string skin = "default")
    {
        lock (_lock)
        {
            if (_players.ContainsKey(playerId))
                return;

            _players[playerId] = new Player(
                playerId,
                x,
                y,
                z,
                rotation,
                speed,
                skin
            );

            _playerSkins[playerId] = skin;
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

    public void UpdatePlayerSkin(string playerId, string skin)
    {
        lock (_lock)
        {
            if (_players.TryGetValue(playerId, out var player))
            {
                player.SetSkin(skin);
                _playerSkins[playerId] = skin;
            }
        }
    }

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

    // =============================
    // QUIZ STATE
    // =============================
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
        if (string.IsNullOrWhiteSpace(player.Id) || player.Id == "0")
            return;

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var userRepo = scope.ServiceProvider.GetRequiredService<UserRepository>();

            var user = await userRepo.GetByIdAsync(player.Id);
            if (user == null)
                return;

            user.TotalScore += player.Points;
            user.QuestionsAnswered += player.QuestionsAnswered;
            user.CorrectAnswers += player.CorrectAnswers;
            user.DistanceTraveled += (int)player.DistanceTraveled;

            var planets = user.PlanetsVisited.ToList();
            foreach (var p in player.VisitedPlanets)
            {
                if (!planets.Contains(p))
                    planets.Add(p);
            }
            user.PlanetsVisited = planets.ToArray();

            if (player.QuestionsAnswered > 0)
                user.QuizzesCompleted++;

            await userRepo.UpdateAsync(user.Id!, user);

            _logger.LogInformation(
                "Saved stats for user {UserId} (+{Score} pts)",
                user.Id,
                player.Points
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save player progress");
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
                    z = p.PosZ,
                    y = 0
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