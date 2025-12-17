using Microsoft.AspNetCore.Mvc;
using glossaryApi.Data;
using glossaryApi.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using glossaryApi.Dto;
using Microsoft.AspNetCore.Authorization;

namespace glossaryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagsController : BaseController
    {
        private readonly AppDbContext _context;

        public TagsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var tags = await _context.Tags.ToListAsync();
            return Ok(tags);
        }

        [HttpGet("{termId}")]
        public async Task<IActionResult> Get(int termId)
        {
            var tags = await _context.TagsContract
                            .Where(tc => tc.TermId == termId)
                            .ToListAsync();
            return Ok(tags);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Post(TagDto tag)
        {
            bool tagExists = await _context.Tags.AnyAsync(t => t.Name == tag.Name);

            if (tagExists)
            {
                return Conflict($"Tag with name '{tag.Name}' already exists");
            }

            _context.Tags.Add(new Tags(){ Name = tag.Name });
            await _context.SaveChangesAsync();
            return Ok("Added Successfully");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag == null)
                return NotFound("Tag not found.");

            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();
            return Ok("Deleted tag and its associations");
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Put(TagDto updatedTag)
        {
            var tag = await _context.Tags
                .FirstOrDefaultAsync(t => t.TagId == updatedTag.TagId);

            if (tag == null)
                return NotFound("Tag not found");

            tag.Name = updatedTag.Name;

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
