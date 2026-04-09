using System.Net.Http.Json;
using Solario.Models;

namespace Solario.Test.Integration.Controllers;

public class ShopControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ShopControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
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

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }
}