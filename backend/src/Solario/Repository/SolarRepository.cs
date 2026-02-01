using Solario.Abstractions;

namespace Solario.Repository;

public class SolarRepository
{
    public async Task AddPlanet()
    {
        await Task.CompletedTask;
    }

    public async Task<List<Planet>> GetPlanets()
    {
        await Task.CompletedTask;
        return new List<Planet>()
        {
            new Planet("eee",1,1,1,1),
            new Planet("uuuu",2,1,2,1),
        };
    }
}