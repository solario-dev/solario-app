using Solario.Abstractions;

namespace Solario.Repository;

public class SolarRepository
{
    public async Task AddPlanet()
    {
    }

    public async Task<List<Planet>> GetPlanets()
    {
        return new List<Planet>()
        {
            new Planet(1,1,1,1),
            new Planet(2,1,2,1),
        };
    }
}