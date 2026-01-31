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

            var existingItems = await _shopRepo.GetAllAsync();
            
            var passports = new List<ShopItem>
            {
                new ShopItem { Name = "Mercury Passport", Price = 500, Type = "passport", ImageUrl = "/textures/mercury.jpg", Description = "Permit for Mercury." },
                new ShopItem { Name = "Venus Passport", Price = 1000, Type = "passport", ImageUrl = "/textures/venus.jpg", Description = "Permit for Venus." },
                new ShopItem { Name = "Earth Passport", Price = 1500, Type = "passport", ImageUrl = "/textures/earth.jpg", Description = "Permit for Earth." },
                new ShopItem { Name = "Mars Passport", Price = 2000, Type = "passport", ImageUrl = "/textures/mars.jpg", Description = "Permit for Mars." },
                new ShopItem { Name = "Jupiter Passport", Price = 4000, Type = "passport", ImageUrl = "/textures/jupiter.jpg", Description = "Permit for Jupiter." },
                new ShopItem { Name = "Saturn Passport", Price = 6000, Type = "passport", ImageUrl = "/textures/saturn.jpg", Description = "Permit for Saturn." },
                new ShopItem { Name = "Uranus Passport", Price = 9000, Type = "passport", ImageUrl = "/textures/uranus.jpg", Description = "Permit for Uranus." },
                new ShopItem { Name = "Neptune Passport", Price = 12000, Type = "passport", ImageUrl = "/textures/neptune.jpg", Description = "Permit for Neptune." }
            };

            var skins = new List<ShopItem>
            {
                new ShopItem
                {
                    Id = "falcon_mk1",
                    Name = "Falcon MK-1",
                    Description = "A legendary smuggler ship. Very fast, very dangerous.",
                    Price = 50000,
                    Type = "skin",
                    ImageUrl = "/textures/falcon.png"
                }
            };

            var allItems = passports.Concat(skins);

            foreach (var item in allItems)
            {
                if (!existingItems.Any(i => i.Name == item.Name))
                {
                    // Ustawiamy ID 'falcon', żeby łatwo wykryć ten model na froncie
                    if (item.Type == "skin") item.Id = "falcon"; 
                    
                    await _shopRepo.CreateAsync(item);
                }
            }
        }
    }
}