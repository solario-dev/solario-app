using Solario.Models;
using Solario.Repository;
using BCrypt.Net;

namespace Solario.Data
{
    public class DbSeeder
    {
        private readonly UserRepository _userRepo;
        private readonly ShopRepository _shopRepo;

        public DbSeeder(UserRepository userRepo, ShopRepository shopRepo)
        {
            _userRepo = userRepo;
            _shopRepo = shopRepo;
        }

        public async Task SeedAsync()
        {
            var adminEmail = "admin@solario.com";
            var existingAdmin = await _userRepo.GetByEmailAsync(adminEmail);

            if (existingAdmin == null)
            {
                var admin = new User
                {
                    Username = "Commander",
                    Email = adminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = "Admin",
                    Level = 10,
                    Credits = 999999,
                    Wins = 100
                };
                await _userRepo.CreateAsync(admin);
            }

            var userEmail = "user@solario.com";
            var existingUser = await _userRepo.GetByEmailAsync(userEmail);

            if (existingUser == null)
            {
                var user = new User
                {
                    Username = "Cadet",
                    Email = userEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                    Role = "User",
                    Level = 1,
                    Credits = 0
                };
                await _userRepo.CreateAsync(user);
            }

            var items = await _shopRepo.GetAllAsync();
            if (!items.Any())
            {
                var passports = new List<ShopItem>
                {
                    new ShopItem
                    {
                        Name = "Mercury Passport",
                        Description = "Authorization to land on the scorched surface of Mercury.",
                        Price = 500,
                        Type = "passport",
                        ImageUrl = "/textures/mercury.jpg"
                    },
                    new ShopItem
                    {
                        Name = "Venus Passport",
                        Description = "Clearance for atmospheric entry into Venus.",
                        Price = 1000,
                        Type = "passport",
                        ImageUrl = "/textures/venus.jpg"
                    },
                    new ShopItem
                    {
                        Name = "Earth Passport",
                        Description = "License to revisit the cradle of humanity.",
                        Price = 1500,
                        Type = "passport",
                        ImageUrl = "/textures/earth.jpg"
                    },
                    new ShopItem
                    {
                        Name = "Mars Passport",
                        Description = "Permit for the red dust colonies.",
                        Price = 2000,
                        Type = "passport",
                        ImageUrl = "/textures/mars.jpg"
                    },
                    new ShopItem
                    {
                        Name = "Jupiter Passport",
                        Description = "Access to the gas giant's orbital stations.",
                        Price = 4000,
                        Type = "passport",
                        ImageUrl = "/textures/jupiter.jpg"
                    },
                    new ShopItem
                    {
                        Name = "Saturn Passport",
                        Description = "Clearance to navigate the rings of Saturn.",
                        Price = 6000,
                        Type = "passport",
                        ImageUrl = "/textures/saturn.jpg"
                    },
                    new ShopItem
                    {
                        Name = "Uranus Passport",
                        Description = "Authorization for the icy giant exploration.",
                        Price = 9000,
                        Type = "passport",
                        ImageUrl = "/textures/uranus.jpg"
                    },
                    new ShopItem
                    {
                        Name = "Neptune Passport",
                        Description = "Deep space permit for the farthest planet.",
                        Price = 12000,
                        Type = "passport",
                        ImageUrl = "/textures/neptune.jpg"
                    }
                };

                foreach (var item in passports)
                {
                    await _shopRepo.CreateAsync(item);
                }
            }
        }
    }
}