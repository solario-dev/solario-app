using Solario.Abstractions;
using Solario.Repository;

namespace Solario.Services;

public class PlanetService
{
    public async Task<List<Planet>> GetPlanets()
    {
        var repository = new SolarRepository();
        return await repository.GetPlanets();
    }
}