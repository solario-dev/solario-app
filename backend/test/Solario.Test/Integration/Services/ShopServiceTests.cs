using Microsoft.Extensions.DependencyInjection;
using Solario.Models;
using Solario.Repository;
using Solario.Services;

namespace Solario.Test.Integration.Services;

public class ShopServiceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ShopServiceTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PurchaseItemAsync_Success_DeductsCreditsAndAddsToInventory()
    {
        using var scope = _factory.Services.CreateScope();
        var shopService = scope.ServiceProvider.GetRequiredService<ShopService>();
        var userRepo = scope.ServiceProvider.GetRequiredService<UserRepository>();
        var shopRepo = scope.ServiceProvider.GetRequiredService<ShopRepository>();

        var user = new User 
        { 
            Username = "Buyer", 
            Email = $"buyer_{Guid.NewGuid()}@test.com", 
            PasswordHash = "hash", 
            Credits = 1000 
        };
        await userRepo.CreateAsync(user);

        var item = new ShopItem { Name = "Cool Skin", Price = 500, Type = "skin" };
        await shopRepo.CreateAsync(item);

        var result = await shopService.PurchaseItemAsync(user.Id!, item.Id);

        result.Should().Be("Success");
        var updatedUser = await userRepo.GetByIdAsync(user.Id!);
        updatedUser!.Credits.Should().Be(500);
        updatedUser.Inventory.Should().Contain(item.Id);
    }

    [Fact]
    public async Task PurchaseItemAsync_InsufficientFunds_ReturnsErrorMessage()
    {
        using var scope = _factory.Services.CreateScope();
        var shopService = scope.ServiceProvider.GetRequiredService<ShopService>();
        var userRepo = scope.ServiceProvider.GetRequiredService<UserRepository>();
        var shopRepo = scope.ServiceProvider.GetRequiredService<ShopRepository>();

        var user = new User 
        { 
            Username = "Poor", 
            Email = $"poor_{Guid.NewGuid()}@test.com", 
            PasswordHash = "hash", 
            Credits = 100 
        };
        await userRepo.CreateAsync(user);

        var item = new ShopItem { Name = "Expensive Skin", Price = 500, Type = "skin" };
        await shopRepo.CreateAsync(item);

        var result = await shopService.PurchaseItemAsync(user.Id!, item.Id);

        result.Should().Be("Insufficient funds");
    }

    [Fact]
    public async Task PurchaseItemAsync_AlreadyOwned_ReturnsErrorMessage()
    {
        using var scope = _factory.Services.CreateScope();
        var shopService = scope.ServiceProvider.GetRequiredService<ShopService>();
        var userRepo = scope.ServiceProvider.GetRequiredService<UserRepository>();
        var shopRepo = scope.ServiceProvider.GetRequiredService<ShopRepository>();

        var item = new ShopItem { Name = "Owned Skin", Price = 500, Type = "skin" };
        await shopRepo.CreateAsync(item);

        var user = new User 
        { 
            Username = "Owner", 
            Email = $"owner_{Guid.NewGuid()}@test.com", 
            PasswordHash = "hash", 
            Credits = 1000, 
            Inventory = new List<string> { item.Id } 
        };
        await userRepo.CreateAsync(user);

        var result = await shopService.PurchaseItemAsync(user.Id!, item.Id);

        result.Should().Be("Item already owned");
    }

    [Fact]
    public async Task PurchaseItemAsync_ItemNotFound_ReturnsErrorMessage()
    {
        using var scope = _factory.Services.CreateScope();
        var shopService = scope.ServiceProvider.GetRequiredService<ShopService>();
        var userRepo = scope.ServiceProvider.GetRequiredService<UserRepository>();

        var user = new User 
        { 
            Username = "Finder", 
            Email = $"finder_{Guid.NewGuid()}@test.com", 
            PasswordHash = "hash", 
            Credits = 1000 
        };
        await userRepo.CreateAsync(user);

        var result = await shopService.PurchaseItemAsync(user.Id!, "invalid_item_id");

        result.Should().Be("Item not found");
    }
}