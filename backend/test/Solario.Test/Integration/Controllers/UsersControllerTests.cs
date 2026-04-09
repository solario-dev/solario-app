using System.Net.Http.Json;
using Solario.Models;

namespace Solario.Test.Integration.Controllers;

public class UsersControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public UsersControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_CreatesNewUserAndReturnsOk()
    {
        var newUser = new User
        {
            Username = "TestUser",
            Email = "test@solario.com",
            PasswordHash = "password123",
            Role = "User",
            Level = 1,
            Credits = 0
        };

        var response = await _client.PostAsJsonAsync("/api/Users/register", newUser);

        response.EnsureSuccessStatusCode();
        var createdUser = await response.Content.ReadFromJsonAsync<User>();
        
        createdUser.Should().NotBeNull();
        createdUser!.Email.Should().Be(newUser.Email);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkAndToken()
    {
        var newUser = new User
        {
            Username = "LoginUser",
            Email = "login@solario.com",
            PasswordHash = "password123",
            Role = "User",
            Level = 1,
            Credits = 0
        };

        await _client.PostAsJsonAsync("/api/Users/register", newUser);

        var loginRequest = new LoginRequest
        {
            Email = "login@solario.com",
            Password = "password123"
        };

        var response = await _client.PostAsJsonAsync("/api/Users/login", loginRequest);

        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("token");
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var loginRequest = new LoginRequest
        {
            Email = "nonexistent@solario.com",
            Password = "wrongpassword"
        };

        var response = await _client.PostAsJsonAsync("/api/Users/login", loginRequest);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
    }
}