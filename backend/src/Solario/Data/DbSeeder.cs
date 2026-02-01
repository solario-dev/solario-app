using Solario.Models;
using Solario.Repository;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore; // Potrzebne do contextu

namespace Solario.Data
{
    public class DbSeeder
    {
        private readonly UserRepository _userRepo;
        private readonly ShopRepository _shopRepo;
        private readonly PostgresContext _postgresContext; // Dodajemy PostgresContext

        public DbSeeder(UserRepository userRepo, ShopRepository shopRepo, PostgresContext postgresContext)
        {
            _userRepo = userRepo;
            _shopRepo = shopRepo;
            _postgresContext = postgresContext;
        }

        public async Task SeedAsync()
        {
            // --- MONGO SEED (Users & Shop) ---
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
                    if (item.Type == "skin") item.Id = "falcon"; 
                    await _shopRepo.CreateAsync(item);
                }
            }

            // --- POSTGRES SEED (Questions) ---
            // Upewnij się, że baza jest utworzona
            await _postgresContext.Database.EnsureCreatedAsync();

            if (!await _postgresContext.Questions.AnyAsync())
            {
                var marsQuestion = new Question
                {
                    Id = Guid.NewGuid(),
                    PlanetName = "mars",
                    Text = "What creates the reddish color of Mars?"
                };
                var marsAnswers = new List<Answer>
                {
                    new Answer { Id = Guid.NewGuid(), Text = "Iron Oxide (Rust)", QuestionId = marsQuestion.Id },
                    new Answer { Id = Guid.NewGuid(), Text = "Red Sandstone", QuestionId = marsQuestion.Id },
                    new Answer { Id = Guid.NewGuid(), Text = "Atmospheric gases", QuestionId = marsQuestion.Id },
                    new Answer { Id = Guid.NewGuid(), Text = "Volcanic Ash", QuestionId = marsQuestion.Id }
                };
                marsQuestion.Answers = marsAnswers;
                marsQuestion.CorrectAnswerId = marsAnswers[0].Id; // Iron Oxide

                var earthQuestion = new Question
                {
                    Id = Guid.NewGuid(),
                    PlanetName = "earth",
                    Text = "Which layer of Earth's atmosphere contains the ozone layer?"
                };
                var earthAnswers = new List<Answer>
                {
                    new Answer { Id = Guid.NewGuid(), Text = "Troposphere", QuestionId = earthQuestion.Id },
                    new Answer { Id = Guid.NewGuid(), Text = "Stratosphere", QuestionId = earthQuestion.Id },
                    new Answer { Id = Guid.NewGuid(), Text = "Mesosphere", QuestionId = earthQuestion.Id },
                    new Answer { Id = Guid.NewGuid(), Text = "Thermosphere", QuestionId = earthQuestion.Id }
                };
                earthQuestion.Answers = earthAnswers;
                earthQuestion.CorrectAnswerId = earthAnswers[1].Id; // Stratosphere

                _postgresContext.Questions.AddRange(marsQuestion, earthQuestion);
                await _postgresContext.SaveChangesAsync();
            }
        }
    }
}