using Microsoft.AspNetCore.Mvc;
using Solario.Models;
using Solario.Repository;
using Solario.Services;

namespace Solario.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShopController : ControllerBase
    {
        private readonly ShopRepository _repo;
        private readonly ShopService _service;
        private readonly IWebHostEnvironment _env;

        public ShopController(ShopRepository repo, ShopService service, IWebHostEnvironment env)
        {
            _repo = repo;
            _service = service;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ShopItem item)
        {
            await _repo.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ShopItem item)
        {
            var updated = await _repo.UpdateAsync(id, item);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _repo.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPost("purchase/{userId}/{itemId}")]
        public async Task<IActionResult> Purchase(string userId, string itemId)
        {
            var result = await _service.PurchaseItemAsync(userId, itemId);
            if (result == "Success") return Ok(new { message = result });
            return BadRequest(new { message = result });
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsFolder = Path.Combine(_env.WebRootPath, "images", "shop");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var url = $"/images/shop/{uniqueFileName}";
            return Ok(new { imageUrl = url });
        }
    }
}