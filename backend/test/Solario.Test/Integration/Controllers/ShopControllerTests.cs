using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Solario.Models;

namespace Solario.Test.Integration.Controllers;

public class ShopControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ShopControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task AuthenticateAsAdminAsync()
    {
        var email = $"admin_{Guid.NewGuid()}@solario.com";
        var newUser = new User { Username = "AdminShop", Email = email, PasswordHash = "pass", Role = "Admin" };
        await _client.PostAsJsonAsync("/api/Users/register", newUser);
        var loginResponse = await _client.PostAsJsonAsync("/api/Users/login", new LoginRequest { Email = email, Password = "pass" });
        var loginData = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginData.GetProperty("token").GetString());
    }

    private async Task<string> AuthenticateAsUserAsync()
    {
        var email = $"user_{Guid.NewGuid()}@solario.com";
        var newUser = new User { Username = "UserShop", Email = email, PasswordHash = "pass", Role = "User", Credits = 10000 };
        await _client.PostAsJsonAsync("/api/Users/register", newUser);
        var loginResponse = await _client.PostAsJsonAsync("/api/Users/login", new LoginRequest { Email = email, Password = "pass" });
        var loginData = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginData.GetProperty("token").GetString());
        return loginData.GetProperty("user").GetProperty("id").GetString()!;
    }

    [Fact]
    public async Task GetAll_ReturnsOkStatusAndItems()
    {
        var response = await _client.GetAsync("/api/Shop");
        response.EnsureSuccessStatusCode();
        var items = await response.Content.ReadFromJsonAsync<List<ShopItem>>();
        items.Should().NotBeNull();
    }

    [Fact]
    public async Task GetById_ReturnsNotFoundForInvalidId()
    {
        var response = await _client.GetAsync("/api/Shop/invalid_id_format");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task AdminCrudOperations_WorkCorrectly()
    {
        await AuthenticateAsAdminAsync();

        var newItem = new ShopItem { Name = "TestItem", Price = 100, Type = "skin" };
        var createResp = await _client.PostAsJsonAsync("/api/Shop", newItem);
        createResp.EnsureSuccessStatusCode();
        var createdItem = await createResp.Content.ReadFromJsonAsync<ShopItem>();

        var updateItem = new ShopItem { Id = createdItem!.Id, Name = "UpdatedItem", Price = 200, Type = "skin" };
        var updateResp = await _client.PutAsJsonAsync($"/api/Shop/{createdItem.Id}", updateItem);
        updateResp.EnsureSuccessStatusCode();

        var deleteResp = await _client.DeleteAsync($"/api/Shop/{createdItem.Id}");
        deleteResp.EnsureSuccessStatusCode();

        var getDeletedResp = await _client.GetAsync($"/api/Shop/{createdItem.Id}");
        getDeletedResp.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Purchase_ValidItem_ReturnsOk()
    {
        await AuthenticateAsAdminAsync();
        var newItem = new ShopItem { Name = "PurchaseItem", Price = 100, Type = "skin" };
        var createResp = await _client.PostAsJsonAsync("/api/Shop", newItem);
        var createdItem = await createResp.Content.ReadFromJsonAsync<ShopItem>();

        var userId = await AuthenticateAsUserAsync();
        var purchaseResp = await _client.PostAsync($"/api/Shop/purchase/{userId}/{createdItem!.Id}", null);
        
        purchaseResp.EnsureSuccessStatusCode();
    }
}