namespace Solario.Services;

using Solario.Abstractions;
using Solario.Repository;
using System.Text.Json;

public class SimulationService
{
    private readonly object _lock = new();
    private readonly List<Planet> _planets = new();

    private Thread? _thread;
    private bool _running = false;
    private float _dt = 1f / 30f;

    public float OrbitScale { get; set; } = 1.0f;
    public float PlanetScale { get; set; } = 1.0f;
    public float SimSpeed { get; set; } = 1.0f;

    public void InitPlanet(float orbitDiameter, float yearLength, float dayLength, float planetDiameter)
    {
        lock (_lock)
        {
            _planets.Add(new Planet(
                orbitDiameter * OrbitScale,
                yearLength,
                dayLength,
                planetDiameter * PlanetScale
            ));
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
                foreach (var p in _planets)
                    p.Move(_dt * SimSpeed);
            }
            Thread.Sleep((int)(_dt * 1000));
        }
    }

    public List<Planet> GetPlanetsSnapshot()
    {
        lock (_lock)
        {
            return new List<Planet>(_planets);
        }
    }

    // ------------------------
    // Nowa metoda: serializacja JSON
    // ------------------------
    public string GetPlanetsJson()
    {
        lock (_lock)
        {
            return JsonSerializer.Serialize(_planets, new JsonSerializerOptions
            {
                WriteIndented = true
            });
        }
    }
}