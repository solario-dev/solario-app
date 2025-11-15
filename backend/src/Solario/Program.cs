using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Solario.Services; // namespace dla SimulationService

var builder = WebApplication.CreateBuilder(args);

// ------------------------
// Rejestracja usług
// ------------------------

// Dodajemy kontrolery
builder.Services.AddControllers();

// Dodajemy Swagger (przydatne do testowania API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Rejestrujemy SimulationService jako singleton
builder.Services.AddSingleton<SimulationService>();

var app = builder.Build();

// ------------------------
// Middleware
// ------------------------
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = string.Empty;
});

app.UseHttpsRedirection();
app.UseAuthorization();

// Mapowanie kontrolerów
app.MapControllers();

// ------------------------
// Inicjalizacja i start symulacji
// ------------------------
var simulation = app.Services.GetRequiredService<SimulationService>();

// Możesz ustawić parametry globalne symulacji
simulation.OrbitScale = 1.0f;
simulation.PlanetScale = 1.0f;
simulation.SimSpeed = 1.0f;

// Dodaj przykładowe planety
simulation.InitPlanet(100, 10, 2, 10);
simulation.InitPlanet(180, 15, 3, 15);
simulation.InitPlanet(260, 22, 4, 18);

// Startujemy symulację w tle
simulation.Start();

// ------------------------
// Uruchomienie aplikacji
// ------------------------
app.Run();