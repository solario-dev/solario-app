using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Solario.Models;

namespace Solario.Test.Integration.Controllers;

public class UsersControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public UsersControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> AuthenticateAsUserAsync(string email, string password)
    {
        var loginResponse = await _client.PostAsJsonAsync("/api/Users/login", new LoginRequest { Email = email, Password = password });
        var loginData = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var token = loginData.GetProperty("token").GetString();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return loginData.GetProperty("user").GetProperty("id").GetString()!;
    }

    [Fact]
    public async Task Register_CreatesNewUserAndReturnsOk()
    {
        var newUser = new User { Username = "TestUser2", Email = $"test2_{Guid.NewGuid()}@solario.com", PasswordHash = "password123", Role = "User" };
        var response = await _client.PostAsJsonAsync("/api/Users/register", newUser);
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var loginRequest = new LoginRequest { Email = "nonexistent@solario.com", Password = "wrongpassword" };
        var response = await _client.PostAsJsonAsync("/api/Users/login", loginRequest);
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetMyClaims_ReturnsOk()
    {
        var email = $"claims_{Guid.NewGuid()}@solario.com";
        await _client.PostAsJsonAsync("/api/Users/register", new User { Username = "Claims", Email = email, PasswordHash = "pass" });
        await AuthenticateAsUserAsync(email, "pass");

        var response = await _client.GetAsync("/api/Users/me");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetByIdOrUsername_ReturnsUser()
    {
        var email = $"get_{Guid.NewGuid()}@solario.com";
        var username = $"GetUser_{Guid.NewGuid()}";
        var createResp = await _client.PostAsJsonAsync("/api/Users/register", new User { Username = username, Email = email, PasswordHash = "pass" });
        var user = await createResp.Content.ReadFromJsonAsync<User>();

        var responseById = await _client.GetAsync($"/api/Users/{user!.Id}");
        responseById.EnsureSuccessStatusCode();

        var responseByUsername = await _client.GetAsync($"/api/Users/{username}");
        responseByUsername.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task EquipSkin_ReturnsOk()
    {
        var email = $"equip_{Guid.NewGuid()}@solario.com";
        await _client.PostAsJsonAsync("/api/Users/register", new User { Username = "Equip", Email = email, PasswordHash = "pass" });
        var userId = await AuthenticateAsUserAsync(email, "pass");

        var response = await _client.PostAsync($"/api/Users/equip/{userId}/default", null);
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task UpdateAndAdminDelete_WorksCorrectly()
    {
        var email = $"update_{Guid.NewGuid()}@solario.com";
        var createResp = await _client.PostAsJsonAsync("/api/Users/register", new User { Username = "ToUpdate", Email = email, PasswordHash = "pass" });
        var user = await createResp.Content.ReadFromJsonAsync<User>();

        await AuthenticateAsUserAsync(email, "pass");
        user!.Level = 5;
        var updateResp = await _client.PutAsJsonAsync($"/api/Users/{user.Id}", user);
        updateResp.EnsureSuccessStatusCode();

        var adminEmail = $"admin_del_{Guid.NewGuid()}@solario.com";
        await _client.PostAsJsonAsync("/api/Users/register", new User { Username = "AdminDel", Email = adminEmail, PasswordHash = "pass", Role = "Admin" });
        await AuthenticateAsUserAsync(adminEmail, "pass");

        var deleteResp = await _client.DeleteAsync($"/api/Users/{user.Id}");
        deleteResp.EnsureSuccessStatusCode();
    }
}