using Microsoft.AspNetCore.Mvc;
using glossaryApi.Data;
using glossaryApi.Models;
using glossaryApi.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace glossaryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SynonymsController : BaseController
    {
        private readonly AppDbContext _context;

        public SynonymsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("term/{termId}")]
        public async Task<IActionResult> GetByTermId(int termId)
        {
            try
            {
                var synonyms = await _context.Synonyms
                    .Include(s => s.SynonymTerm)
                    .Where(s => s.TermId == termId)
                    .Select(s => new SynonymDto
                    {
                        SynonymId = s.SynonymId,
                        TermId = s.TermId,
                        SynonymTermId = s.SynonymTermId,
                        CreatedAt = s.CreatedAt,
                        SynonymTermName = s.SynonymTerm.Name,
                        SynonymTermDescription = s.SynonymTerm.Description
                    })
                    .ToListAsync();

                return Ok(synonyms);
            }
            catch (Exception ex)
            {
                return HandleError(ex, "fetching synonyms");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var synonym = await _context.Synonyms
                    .Include(s => s.SynonymTerm)
                    .FirstOrDefaultAsync(s => s.SynonymId == id);

                if (synonym == null)
                    return NotFound("Synonym not found");

                var dto = new SynonymDto
                {
                    SynonymId = synonym.SynonymId,
                    TermId = synonym.TermId,
                    SynonymTermId = synonym.SynonymTermId,
                    CreatedAt = synonym.CreatedAt,
                    SynonymTermName = synonym.SynonymTerm.Name,
                    SynonymTermDescription = synonym.SynonymTerm.Description
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return HandleError(ex, "fetching synonym");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Post([FromBody] CreateSynonymDto dto)
        {
            try
            {
                var term = await _context.Terms.FindAsync(dto.TermId);
                if (term == null)
                    return NotFound("Term not found");

                var synonymTerm = await _context.Terms.FindAsync(dto.SynonymTermId);
                if (synonymTerm == null)
                    return NotFound("Synonym term not found");

                if (dto.TermId == dto.SynonymTermId)
                    return BadRequest("A term cannot be a synonym of itself");

                var duplicate = await _context.Synonyms
                    .AnyAsync(s => s.TermId == dto.TermId && s.SynonymTermId == dto.SynonymTermId);

                if (duplicate)
                    return BadRequest($"'{synonymTerm.Name}' is already a synonym for this term.");

                var synonym = new Synonyms
                {
                    TermId = dto.TermId,
                    SynonymTermId = dto.SynonymTermId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Synonyms.Add(synonym);
                await _context.SaveChangesAsync();

                return Ok("Synonym successfully added");
            }
            catch (Exception ex)
            {
                return HandleError(ex, "creating synonym");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var synonym = await _context.Synonyms.FindAsync(id);
                if (synonym == null)
                    return NotFound("Synonym not found");

                _context.Synonyms.Remove(synonym);
                await _context.SaveChangesAsync();
                return Ok("Synonym deleted successfully");
            }
            catch (Exception ex)
            {
                return HandleError(ex, "deleting synonym");
            }
        }
    }
}
