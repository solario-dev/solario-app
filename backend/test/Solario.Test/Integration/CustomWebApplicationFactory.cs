using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Solario.Data;
using Solario.Configuration;
using Testcontainers.MongoDb;
using Testcontainers.PostgreSql;

namespace Solario.Test.Integration;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer;
    private readonly MongoDbContainer _mongoContainer;

    public CustomWebApplicationFactory()
    {
        _dbContainer = new PostgreSqlBuilder()
            .WithImage("postgres:16")
            .WithDatabase("solario_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        _mongoContainer = new MongoDbBuilder()
            .WithImage("mongo:7")
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();
        await _mongoContainer.StartAsync();
    }

    public new async Task DisposeAsync()
    {
        await _dbContainer.DisposeAsync();
        await _mongoContainer.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<PostgresContext>));
            if (descriptor != null) services.Remove(descriptor);

            services.AddDbContext<PostgresContext>(options =>
            {
                options.UseNpgsql(_dbContainer.GetConnectionString());
            });

            var mongoSettingsDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(MongoDbSettings));
            if (mongoSettingsDescriptor != null) services.Remove(mongoSettingsDescriptor);

            services.AddSingleton(new MongoDbSettings
            {
                ConnectionString = _mongoContainer.GetConnectionString(),
                Database = "solario_test"
            });
        });
    }
}