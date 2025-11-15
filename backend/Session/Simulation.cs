using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;

public class Simulation
{
    public float OrbitScale { get; set; } = 1.0f;
    public float PlanetScale { get; set; } = 1.0f;
    public float SimSpeed { get; set; } = 1.0f;

    private List<Planet> _planets = new List<Planet>();
    private bool _running = false;
    private Thread? _thread;
    private readonly object _lock = new object();
    private float _dt = 1f / 30f; // krok 1/30s

    public Simulation(float orbitScale = 1.0f, float planetScale = 1.0f, float simSpeed = 1.0f)
    {
        OrbitScale = orbitScale;
        PlanetScale = planetScale;
        SimSpeed = simSpeed;
    }

    public void InitPlanet(float orbitDiameter, float yearLength, float dayLength, float planetDiameter)
    {
        lock (_lock)
        {
            var p = new Planet(
                orbitDiameter * OrbitScale,
                yearLength,
                dayLength,
                planetDiameter * PlanetScale
            );
            _planets.Add(p);
        }
    }

    public void Start()
    {
        if (_running) return;
        _running = true;
        _thread = new Thread(RunLoop);
        _thread.IsBackground = true;
        _thread.Start();
        Console.WriteLine("Symulacja rozpoczęta...");
    }

    public void Stop()
    {
        _running = false;
        _thread?.Join();
        Console.WriteLine("Symulacja zatrzymana.");
    }

    private void RunLoop()
    {
        while (_running)
        {
            float scaledDt = _dt * SimSpeed;

            lock (_lock)
            {
                foreach (var planet in _planets)
                    planet.Move(scaledDt);
            }

            GenerateJson(false); // wypisz stan w czasie rzeczywistym
            Thread.Sleep((int)(_dt * 1000)); // tempo symulacji
        }
    }

    public string GenerateJson(bool pretty = true)
    {
        lock (_lock)
        {
            var list = new List<object>();
            foreach (var p in _planets)
            {
                list.Add(new
                {
                    orbit_diameter = p.OrbitDiameter,
                    year_length = p.YearLength,
                    day_length = p.DayLength,
                    planet_diameter = p.PlanetDiameter,
                    claimed = p.Claimed,
                    pos_x = p.PosX,
                    pos_y = p.PosY
                });
            }

            var options = new JsonSerializerOptions { WriteIndented = pretty };
            string json = JsonSerializer.Serialize(list, options);
            Console.WriteLine(json);
            return json;
        }
    }
}
