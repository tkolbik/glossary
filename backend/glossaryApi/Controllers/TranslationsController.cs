using Microsoft.AspNetCore.Mvc;
using glossaryApi.Data;
using glossaryApi.Models;
using glossaryApi.Dto;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using glossaryApi.Mappers;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Text.Json;
using System.Text;
using glossaryApi.Enums;
using Microsoft.AspNetCore.Authorization;
using glossaryApi.Utils;

namespace glossaryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TranslationsController : BaseController
    {
        private readonly AppDbContext _context;

        public TranslationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get(
            int page = 1,
            int pageSize = 32,
            string? search = null,
            string? letter = null,
            string? languageCode = null,
            string? status = null)
        {
            try
            {
                var query = _context.Translations
                    .Include(t => t.Term)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(languageCode))
                {
                    query = query.Where(t => t.LanguageCode == languageCode);
                }

                if (!string.IsNullOrEmpty(status))
                {
                    if (Enum.TryParse<TranslationStatus>(status, out var statusEnum))
                    {
                        query = query.Where(t => t.Status == statusEnum);
                    }
                }

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(t => 
                        t.Name.Contains(search) || 
                        t.Description.Contains(search)
                    );
                }

                if (!string.IsNullOrEmpty(letter))
                {
                    query = query.Where(t => t.Name.StartsWith(letter));
                }

                var totalCount = await query.CountAsync();

                var translations = await query
                    .OrderBy(t => t.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var translationDtos = translations.Select(t => TranslationMapper.ToDto(t)).ToList();

                return Ok(PaginationHelper.CreatePagedResponse(
                    translationDtos,
                    page,
                    pageSize,
                    totalCount,
                    "translations"));
            }
            catch (Exception ex)
            {
                return HandleError(ex, "fetching translations");
            }
        }

        [HttpGet("untranslated/{languageCode}")]
        public async Task<IActionResult> GetUntranslatedTerms(
            string languageCode,
            int page = 1,
            int pageSize = 32,
            string? search = null)
        {
            var language = await _context.Languages
                .FirstOrDefaultAsync(l => l.Code == languageCode);

            if (language == null)
                return NotFound($"Language code '{languageCode}' not found.");

            var existingTranslationIds = await _context.Translations
                .Where(t => t.LanguageCode == language.Code)
                .Select(t => t.TermId)
                .ToListAsync();

            var query = _context.Terms
                .Where(term => !existingTranslationIds.Contains(term.TermId))
                .Include(term => term.TagContract)
                .ThenInclude(tag => tag.Tag)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(term => 
                    term.Name.Contains(search) || 
                    term.Description.Contains(search) ||
                    term.Reference.Contains(search));
            }

            var totalCount = await query.CountAsync();

            var untranslatedTerms = await query
                .OrderBy(term => term.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(term => term.ToDto())
                .ToListAsync();

            return Ok(PaginationHelper.CreatePagedResponse(
                untranslatedTerms,
                page,
                pageSize,
                totalCount,
                "terms"));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Post([FromBody] TranslationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            dto.Name = TextUtils.CapitalizeFirstLetter(dto.Name);
            dto.Description = TextUtils.CapitalizeFirstLetter(dto.Description);

            var translation = TranslationMapper.FromDto(dto);
            
            var parentTerm = await _context.Terms.FindAsync(dto.TermId);
            if (parentTerm != null && parentTerm.CreatedAt.HasValue)
            {
                translation.CreatedAt = parentTerm.CreatedAt;
            }
            else
            {
                translation.CreatedAt = DateTime.UtcNow;
            }

            _context.Translations.Add(translation);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Put(TranslationDto updatedTranslation)
        {
            var translation = await _context.Translations
                .FirstOrDefaultAsync(t => t.TermId == updatedTranslation.TermId && t.LanguageCode == updatedTranslation.LanguageCode);

            if (translation == null)
                return NotFound("Translation not found");

            translation.Name = TextUtils.CapitalizeFirstLetter(updatedTranslation.Name);
            translation.Description = TextUtils.CapitalizeFirstLetter(updatedTranslation.Description);

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("reviewed")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkAsReviewed([FromBody] TranslationReviewDto request)
        {
            var translation = await _context.Translations
                .FirstOrDefaultAsync(t => t.TermId == request.TermId && t.LanguageCode == request.LanguageCode);

            if (translation == null)
            {
                return NotFound("Translation not found.");
            }

            translation.Status = TranslationStatus.Consistent;
            await _context.SaveChangesAsync();

            return Ok("Translation marked as reviewed.");
        }

        [HttpDelete("{termId}/{languageCode}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int termId, string languageCode)
        {
            var translation = await _context.Translations
                .FirstOrDefaultAsync(t => t.TermId == termId && t.LanguageCode == languageCode);
            if (translation == null)
            {
                return NotFound("Translation not found.");
            }

            _context.Translations.Remove(translation);
            await _context.SaveChangesAsync();
            return Ok("Deleted Successfully");
        }

        [HttpDelete("{languageCode}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTranslationsByLanguage(string languageCode)
        {
            if (string.IsNullOrWhiteSpace(languageCode))
                return BadRequest("Language code is required.");

            try
            {
                var deletedCount = await _context.Translations
                    .Where(t => t.LanguageCode == languageCode)
                    .ExecuteDeleteAsync();

                if (deletedCount == 0)
                    return NotFound($"No translations found for language '{languageCode}'.");

                return Ok(new { message = $"{deletedCount} translations deleted for language '{languageCode}'." });
            }
            catch (Exception ex)
            {
                return HandleError(ex, "deleting translations by language");
            }
        }

    }
}