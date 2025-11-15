using Microsoft.AspNetCore.Mvc;
using Solario.Services;

namespace Solario.Controllers;


[ApiController]
[Route("api/[controller]")]
public class PlanetController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetWeather()
    {
        var service = new PlanetService();
        var planets = await service.GetPlanets();
        return Ok(planets);
    }
}