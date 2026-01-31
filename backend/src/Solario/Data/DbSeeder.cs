using Solario.Models;
using Solario.Repository;
using BCrypt.Net;

namespace Solario.Data
{
    public class DbSeeder
    {
        private readonly UserRepository _userRepo;

        public DbSeeder(UserRepository userRepo)
        {
            _userRepo = userRepo;
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
                    Credits = 99999,
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
                    Credits = 100
                };
                await _userRepo.CreateAsync(user);
            }
        }
    }
}