using System;
using System.Threading;

class Program
{
    static void Main()
    {
        // konfiguracja symulacji
        var sim = new Simulation(orbitScale: 2.0f, planetScale: 1.0f, simSpeed: 1.0f);

        // inicjacja planet
        sim.InitPlanet(orbitDiameter: 100f, yearLength: 10f, dayLength: 2f, planetDiameter: 10f);
        sim.InitPlanet(orbitDiameter: 180f, yearLength: 15f, dayLength: 3f, planetDiameter: 15f);
        sim.InitPlanet(orbitDiameter: 260f, yearLength: 22f, dayLength: 4f, planetDiameter: 18f);

        // start
        sim.Start();

        // działaj przez 10 sekund
        Thread.Sleep(10_000);

        // zatrzymaj
        sim.Stop();

        Console.WriteLine("\nSymulacja zakończona.");
    }
}
