using Microsoft.AspNetCore.Mvc;
using glossaryApi.Data;
using glossaryApi.Models;
using glossaryApi.Dto;
using glossaryApi.Utils;
using Microsoft.EntityFrameworkCore;
using glossaryApi.Mappers;
using glossaryApi.Enums;
using Microsoft.AspNetCore.Authorization;
using glossaryApi;
using glossaryApi.Services;
using System.Net;

namespace glossaryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TermsController : BaseController
    {
        private readonly AppDbContext _context;
        private readonly LanguageService _languageService;

        public TermsController(AppDbContext context, LanguageService languageService)
        {
            _context = context;
            _languageService = languageService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 32, [FromQuery] string? search = null, [FromQuery] string? letter = null, [FromQuery] string? languageCode = null, [FromQuery] string? tags = null)
        {
            var query = _context.Terms
                .Include(term => term.TagContract)
                .ThenInclude(tag => tag.Tag)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.Name.Contains(search) || t.Description.Contains(search));
            }

            if (!string.IsNullOrEmpty(letter))
            {
                query = query.Where(t => t.Name.StartsWith(letter));
            }

            if (!string.IsNullOrEmpty(languageCode))
            {
                query = query.Where(t => _languageService.IsBaseLanguage(languageCode));
            }

            if (!string.IsNullOrEmpty(tags))
            {
                var tagIds = tags.Split(',').Select(int.Parse).ToList();
                query = query.Where(t => t.TagContract.Any(tc => tagIds.Contains(tc.TagId)));
            }

            var totalCount = await query.CountAsync();

            var terms = await query
                .OrderBy(t => t.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => t.ToDto())
                .ToListAsync();

            return Ok(PaginationHelper.CreatePagedResponse(
                terms,
                page,
                pageSize,
                totalCount,
                "terms"));
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 32, [FromQuery] string? search = null, [FromQuery] string? letter = null, [FromQuery] string? languageCode = null, [FromQuery] string? tags = null)
        {
            var baseTermsQuery = _context.Terms
                .Include(term => term.TagContract!)
                    .ThenInclude(tc => tc.Tag)
                .AsQueryable();

            var translationsQuery = _context.Translations
                .Include(t => t.Term!)
                    .ThenInclude(t => t.TagContract!)
                        .ThenInclude(tc => tc.Tag)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                baseTermsQuery = baseTermsQuery.Where(t => t.Name.Contains(search) || t.Description.Contains(search));
                    translationsQuery = translationsQuery.Where(t => t.Name.Contains(search) || t.Description.Contains(search));
            }

            if (!string.IsNullOrEmpty(letter))
            {
                baseTermsQuery = baseTermsQuery.Where(t => t.Name.StartsWith(letter));
                    translationsQuery = translationsQuery.Where(t => t.Name.StartsWith(letter));
            }

            if (!string.IsNullOrEmpty(languageCode))
            {
                if (_languageService.IsBaseLanguage(languageCode))
                {
                    translationsQuery = translationsQuery.Where(t => false);
                }
                else
                {
                    baseTermsQuery = baseTermsQuery.Where(t => false);
                    translationsQuery = translationsQuery.Where(t => t.LanguageCode == languageCode);
                }
            }

            if (!string.IsNullOrEmpty(tags))
            {
                var tagIds = tags.Split(',').Select(int.Parse).ToList();
                baseTermsQuery = baseTermsQuery.Where(t => t.TagContract.Any(tc => tagIds.Contains(tc.TagId)));
                    translationsQuery = translationsQuery.Where(t => t.Term.TagContract.Any(tc => tagIds.Contains(tc.TagId)));
            }

            var baseTerms = await baseTermsQuery
                .Select(t => t.ToDto())
                .ToListAsync();

            var translations = await translationsQuery
                .Select(t => TermsMapper.ToDto(t))
                .ToListAsync();

            var allTerms = baseTerms.Concat(translations)
                .OrderBy(t => t.Name)
                .ToList();

            var totalCount = allTerms.Count;
            var paginatedTerms = allTerms
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(PaginationHelper.CreatePagedResponse(
                paginatedTerms,
                page,
                pageSize,
                totalCount,
                "terms"));
        }

        [HttpGet("{language}/{baseTermName}")]
        public async Task<IActionResult> Get(string language, string baseTermName)
        {
            if (string.IsNullOrWhiteSpace(language) || string.IsNullOrWhiteSpace(baseTermName))
                return BadRequest("Language and base term name are required.");

            var baseTerm = await _context.Terms
                .Include(t => t.TagContract!)
                    .ThenInclude(tc => tc.Tag)
                .FirstOrDefaultAsync(t => t.Name == baseTermName);

            if (baseTerm == null)
                return NotFound($"{LanguageConfiguration.BaseLanguageName} term not found");

            if (language.Equals(LanguageConfiguration.BaseLanguageName, StringComparison.OrdinalIgnoreCase))
            {
                return Ok(baseTerm.ToDto());
            }
            else
            {
                var languageCode = LanguageUtils.GetCodeByName(language);
                var translation = await _context.Translations
                    .FirstOrDefaultAsync(t => t.LanguageCode == languageCode && t.TermId == baseTerm.TermId);

                if (translation == null)
                    return NotFound($"Translation not found for {language}");

                return Ok(TermsMapper.ToDto(translation));
            }
        }

        [HttpGet("navigation/{termName}")]
        public async Task<ActionResult<NavigationResponse>> GetNavigation(string termName, [FromQuery] string? languageCode = null)
        {
            NavigationTermInfo? previousTerm = null;
            NavigationTermInfo? nextTerm = null;

            if (string.IsNullOrEmpty(languageCode) || _languageService.IsBaseLanguage(languageCode))
            {
                var allTermNames = await _context.Terms
                    .OrderBy(t => t.Name)
                    .Select(t => t.Name)
                    .ToListAsync();

                var currentIndex = allTermNames.FindIndex(n => n.Equals(termName, StringComparison.OrdinalIgnoreCase));

                if (currentIndex > 0)
                {
                    var name = allTermNames[currentIndex - 1];
                    previousTerm = new NavigationTermInfo { BaseName = name, DisplayName = name };
                }

                if (currentIndex >= 0 && currentIndex < allTermNames.Count - 1)
                {
                    var name = allTermNames[currentIndex + 1];
                    nextTerm = new NavigationTermInfo { BaseName = name, DisplayName = name };
                }
            }
            else
            {
                var translationsWithBaseNames = await _context.Translations
                    .Where(t => t.LanguageCode == languageCode)
                    .Include(t => t.Term)
                    .OrderBy(t => t.Name)
                    .Select(t => new { TranslationName = t.Name, BaseTermName = t.Term.Name })
                    .ToListAsync();

                var currentBaseTerm = await _context.Terms
                    .FirstOrDefaultAsync(t => t.Name.ToLower() == termName.ToLower());

                if (currentBaseTerm != null)
                {
                    var currentTranslation = await _context.Translations
                        .FirstOrDefaultAsync(t => t.TermId == currentBaseTerm.TermId && t.LanguageCode == languageCode);

                    if (currentTranslation != null)
                    {
                        var currentIndex = translationsWithBaseNames.FindIndex(
                            t => t.BaseTermName.Equals(termName, StringComparison.OrdinalIgnoreCase));

                        if (currentIndex > 0)
                        {
                            var prev = translationsWithBaseNames[currentIndex - 1];
                            previousTerm = new NavigationTermInfo 
                            { 
                                BaseName = prev.BaseTermName, 
                                DisplayName = prev.TranslationName 
                            };
                        }

                        if (currentIndex >= 0 && currentIndex < translationsWithBaseNames.Count - 1)
                        {
                            var next = translationsWithBaseNames[currentIndex + 1];
                            nextTerm = new NavigationTermInfo 
                            { 
                                BaseName = next.BaseTermName, 
                                DisplayName = next.TranslationName 
                            };
                        }
                    }
                }
            }

            return Ok(new NavigationResponse { PreviousTerm = previousTerm, NextTerm = nextTerm });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Post(TermsDto dto)
        {
            try
            {
                dto.Name = TextUtils.CapitalizeFirstLetter(dto.Name);
                dto.Description = TextUtils.CapitalizeFirstLetter(dto.Description);

                var duplicate = await _context.Terms
                .AnyAsync(t => t.Name.ToLower() == dto.Name.Trim().ToLower());

                if (duplicate)
                {
                    return BadRequest($"A term with the name '{dto.Name}' already exists.");
                }

                var existingTags = await _context.Tags
                    .ToListAsync();

                var term = dto.FromDto(existingTags);
                term.CreatedAt = dto.CreatedAt ?? DateTime.UtcNow;

                _context.Terms.Add(term);
                await _context.SaveChangesAsync();
                return Ok("Term successfully added");
            }
            catch (Exception ex)
            {
                return HandleError(ex, "creating term");
            }
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Put([FromBody] TermsDto updatedDto, [FromQuery] bool markTranslationsForReview = true)
        {
            var term = await _context.Terms
                .Include(t => t.TagContract)
                .ThenInclude(tc => tc.Tag)
                .FirstOrDefaultAsync(t => t.TermId == updatedDto.TermId);

            if (term == null)
                return NotFound("Term not found");

            term.Name = TextUtils.CapitalizeFirstLetter(updatedDto.Name);
            term.Reference = updatedDto.Reference;
            term.Description = TextUtils.CapitalizeFirstLetter(updatedDto.Description);
            
            if (updatedDto.CreatedAt.HasValue)
            {
                term.CreatedAt = updatedDto.CreatedAt;
            }
            
            _context.TagsContract.RemoveRange(term.TagContract);

            var tags = new List<TagsContract>();
            foreach (var tag in updatedDto.Tags)
            {
                tags.Add(new TagsContract
                {
                    TermId = term.TermId,
                    TagId = tag.TagId
                });
            }

            _context.TagsContract.AddRange(tags);

            if (markTranslationsForReview)
            {
                var translations = await _context.Translations
                    .Where(t => t.TermId == term.TermId)
                    .ToListAsync();

                foreach (var translation in translations)
                {
                    translation.Status = TranslationStatus.Review;
                }
            }

            await _context.SaveChangesAsync();

            return Ok("Term updated successfully");
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var term = await _context.Terms.FindAsync(id);
            if (term == null)
            {
                return NotFound("Term not found.");
            }

            _context.Terms.Remove(term);
            await _context.SaveChangesAsync();
            return Ok("Deleted Successfully");
        }

        [HttpDelete("full")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAllTermsAndRelated()
        {
            try
            {
                await _context.Synonyms.ExecuteDeleteAsync();
                await _context.TagsContract.ExecuteDeleteAsync();
                await _context.Translations.ExecuteDeleteAsync();
                await _context.Suggestions.ExecuteDeleteAsync();
                await _context.Terms.ExecuteDeleteAsync();
                await _context.SaveChangesAsync();

                return Ok("All terms and related data deleted.");
            }

            catch (Exception ex)
            {
                return HandleError(ex, "deleting all terms");
            }
        }

        public class NavigationTermInfo
        {
            public string BaseName { get; set; } = string.Empty;
            public string DisplayName { get; set; } = string.Empty;
        }

        public class NavigationResponse
        {
            public NavigationTermInfo? PreviousTerm { get; set; }
            public NavigationTermInfo? NextTerm { get; set; }
        }
    }
}
