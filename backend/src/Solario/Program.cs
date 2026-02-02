using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using dotenv.net;
using Solario.Configuration;
using Solario.Data;
using Solario.Repository;
using Solario.Services;
using Solario.Websockets;
using Serilog;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

DotEnv.Load();

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
    var msg = $@"Mongo configuration missing. Please set MONGODB_CONNECTION_STRING and MONGODB_DATABASE.";
    throw new InvalidOperationException(msg);
}

var mongoSettings = new MongoDbSettings { ConnectionString = mongoConn, Database = mongoDb };
builder.Services.AddSingleton(mongoSettings);
builder.Services.AddSingleton<MongoContext>();

builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<ShopRepository>();
builder.Services.AddScoped<ShopService>();
builder.Services.AddScoped<DbSeeder>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddDbContext<PostgresContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Postgres")
    )
);

builder.Services.AddScoped<QuestionRepository>();
builder.Services.AddScoped<QuestionService>();

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
            ValidateLifetime = true,
            RoleClaimType = "role"
        };
    });
}

builder.Services.AddCors(p => p.AddPolicy("AllowReact", policy =>
    policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Solario API",
        Version = "v1"
    });

    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Wpisz token JWT (bez 'Bearer ')"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document)] = []
    });
});
builder.Services.AddSingleton<SimulationService>();
builder.Services.AddSingleton<SimulationWebSocketHandler>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DbSeeder>();
    await seeder.SeedAsync();
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    c.RoutePrefix = string.Empty;
});

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.UseStaticFiles(); 

if (!string.IsNullOrEmpty(jwtKey))
{
    app.UseAuthentication();
    app.UseAuthorization();
}
else
{
    app.UseAuthorization();
}

app.UseWebSockets(new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(30)
});

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
        context.Response.StatusCode = 400;
    }
});

app.MapControllers();

var simulation = app.Services.GetRequiredService<SimulationService>();
simulation.OrbitScale = 1.0f;
simulation.PlanetScale = 1.0f;
simulation.SimSpeed = 1.0f;

simulation.InitPlanet("Mercury", 1158f, 87.97f, 4222.6f, 0.048f);
simulation.InitPlanet("Venus", 1661f, 224.70f, 5832.5f, 0.121f);
simulation.InitPlanet("Earth", 2075f, 365.25f, 24.0f, 0.127f);
simulation.InitPlanet("Mars", 2858f, 686.98f, 24.6f, 0.068f);
simulation.InitPlanet("Jupiter", 8365f, 4332.59f, 9.9f, 1.398f);
simulation.InitPlanet("Saturn", 14816f, 10759.22f, 10.7f, 1.164f);
simulation.InitPlanet("Uranus", 29304f, 30687.15f, 17.2f, 0.507f);
simulation.InitPlanet("Neptune", 45530f, 60190.03f, 16.1f, 0.492f);


simulation.Start();

try
{
    Log.Information("Starting Solario application");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}