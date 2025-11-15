using Microsoft.AspNetCore.Mvc;
using Solario.Services;
using System.Text.Json;

namespace Solario.Controllers
{
    [ApiController]
    [Route("simulations")]
    public class SimulationController : ControllerBase
    {
        private readonly SimulationService _simulationService;

        public SimulationController(SimulationService simulationService)
        {
            _simulationService = simulationService;
        }

        // GET: /simulations/state
        [HttpGet("state")]
        public IActionResult GetSimulationState()
        {
            // Pobieramy snapshot planet z symulacji
            var planets = _simulationService.GetPlanetsSnapshot();

            // Serializacja do JSON
            var json = JsonSerializer.Serialize(planets, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            return Content(json, "application/json");
        }
    }
}