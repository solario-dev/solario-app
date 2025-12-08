using Solario.Models;
using Solario.Repository;

namespace Solario.Services
{
    public class ShopService
    {
        private readonly UserRepository _userRepo;
        private readonly ShopRepository _shopRepo;

        public ShopService(UserRepository userRepo, ShopRepository shopRepo)
        {
            _userRepo = userRepo;
            _shopRepo = shopRepo;
        }

        public async Task<string> PurchaseItemAsync(string userId, string itemId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return "User not found";

            var item = await _shopRepo.GetByIdAsync(itemId);
            if (item == null) return "Item not found";

            if (user.Inventory.Contains(itemId)) return "Item already owned";

            if (user.Credits < item.Price) return "Insufficient funds";

            user.Credits -= item.Price;
            user.Inventory.Add(itemId);

            await _userRepo.UpdateAsync(userId, user);

            return "Success";
        }
    }
}