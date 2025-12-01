using System;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using dotenv.net;
using Solario.Configuration;
using Solario.Data;
using Solario.Repository;
using Microsoft.Extensions.Configuration;
using Solario.Services; // namespace dla SimulationService
using Solario.Services;
using Solario.Websockets;
using System.Net.WebSockets;

var builder = WebApplication.CreateBuilder(args);

// Load .env if present (harmless if not)
DotEnv.Load();

// --- Read Mongo connection string from multiple possible sources (env/appsettings)
string? mongoConn =
    Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING") ??
    Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING") ??
    builder.Configuration["MongoDbSettings:ConnectionString"] ??
    builder.Configuration["MongoDb:ConnectionString"];

string? mongoDb =
    Environment.GetEnvironmentVariable("MONGODB_DATABASE") ??
    Environment.GetEnvironmentVariable("MONGO_DATABASE") ??
    builder.Configuration["MongoDbSettings:DatabaseName"] ??
    builder.Configuration["MongoDb:Database"];

if (string.IsNullOrEmpty(mongoConn) || string.IsNullOrEmpty(mongoDb))
{
    var msg = $@"Mongo configuration missing.
Checked environment variables:
  MONGODB_CONNECTION_STRING={Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING")}
  MONGO_CONNECTION_STRING={Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING")}
  MONGODB_DATABASE={Environment.GetEnvironmentVariable("MONGODB_DATABASE")}
  MONGO_DATABASE={Environment.GetEnvironmentVariable("MONGO_DATABASE")}
Checked appsettings:
  MongoDbSettings:ConnectionString={builder.Configuration["MongoDbSettings:ConnectionString"]}
  MongoDbSettings:DatabaseName={builder.Configuration["MongoDbSettings:DatabaseName"]}
  MongoDb:ConnectionString={builder.Configuration["MongoDb:ConnectionString"]}
  MongoDb:Database={builder.Configuration["MongoDb:Database"]}
Please set MONGODB_CONNECTION_STRING and MONGODB_DATABASE (or update appsettings/Program.cs).";
    throw new InvalidOperationException(msg);
}

var mongoSettings = new MongoDbSettings { ConnectionString = mongoConn, Database = mongoDb };
builder.Services.AddSingleton(mongoSettings);
builder.Services.AddSingleton<MongoContext>();

// Repository
builder.Services.AddScoped<UserRepository>();

// JWT (optional)
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "solario";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "solario_frontend";

if (!string.IsNullOrEmpty(jwtKey))
{
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true
        };
    });
}

// CORS
builder.Services.AddCors(p => p.AddPolicy("AllowReact", policy =>
    policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials()));

// Controllers + Swagger
// ------------------------
// Rejestracja usług
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<SimulationService>();
builder.Services.AddSingleton<SimulationWebSocketHandler>();

var app = builder.Build();

// Swagger UI at root
// ------------------------
// Middleware
// ------------------------
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    c.RoutePrefix = string.Empty;
});

app.UseHttpsRedirection();
app.UseCors("AllowReact");

if (!string.IsNullOrEmpty(jwtKey))
{
    app.UseAuthentication();
    app.UseAuthorization();
}
else
{
    app.UseAuthorization();
}

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

// ------------------------
// Inicjalizacja i start symulacji
// ------------------------
var simulation = app.Services.GetRequiredService<SimulationService>();

// Globalne ustawienia symulacji
simulation.OrbitScale = 1.0f;    // możemy skalować odległości
simulation.PlanetScale = 1.0f;   // możemy skalować rozmiary planet
simulation.SimSpeed = 1.0f;      // 1 tick = 1/30 s

// Init planety (OrbitDiameter w jednostkach, YearLength w sekundach symulacji, DayLength w sekundach, PlanetDiameter w jednostkach)
simulation.InitPlanet("Mercury", 58, 10, 6, 2);
simulation.InitPlanet("Venus", 108, 25, 10, 4);
simulation.InitPlanet("Earth", 150, 30, 10, 4);
simulation.InitPlanet("Mars", 228, 56, 10, 3);
simulation.InitPlanet("Jupiter", 778, 360, 10, 10);
simulation.InitPlanet("Saturn", 1427, 800, 10, 9);
simulation.InitPlanet("Uranus", 2871, 2500, 10, 7);
simulation.InitPlanet("Neptune", 4495, 5000, 10, 7);

// Gracze
simulation.InitPlayer(0, 0, 0, 0, 0, 1);        // start w centrum układu
simulation.InitPlayer(1, 10, 0, 10, 10, 1);    // drugi gracz gdzieś w pobliżu

// Start symulacji
simulation.Start();


// ------------------------
// Uruchomienie aplikacji
// ------------------------
app.Run();
