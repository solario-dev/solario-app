using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Solario.Services;
using Solario.Websockets;
using System.Net.WebSockets;

var builder = WebApplication.CreateBuilder(args);

// Rejestracja usług
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<SimulationService>();
builder.Services.AddSingleton<SimulationWebSocketHandler>();

var app = builder.Build();

// Middleware
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = string.Empty;
});

app.UseHttpsRedirection();
app.UseAuthorization();

// WebSocket
app.UseWebSockets(new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(30)
});

// **Nowy WebSocket endpoint**
app.Map("/simulations/socket", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        var handler = context.RequestServices.GetRequiredService<SimulationWebSocketHandler>();
        await handler.HandleAsync(webSocket);
    }
    else
    {
        context.Response.StatusCode = 400; // nie WebSocket
    }
});

// Kontrolery HTTP
app.MapControllers();

// Start symulacji
var simulation = app.Services.GetRequiredService<SimulationService>();
simulation.OrbitScale = 1.0f;
simulation.PlanetScale = 1.0f;
simulation.SimSpeed = 1.0f;
simulation.InitPlanet("hej", 100, 10, 2, 10);
simulation.InitPlanet("hi",180, 15, 3, 15);
simulation.InitPlanet("hello",260, 22, 4, 18);
simulation.InitPlayer(0,0,0,0,0,1);
simulation.InitPlayer(1,10,10,0,10,1);
simulation.Start();

// Uruchomienie aplikacji
app.Run();