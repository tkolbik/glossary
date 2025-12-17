using Microsoft.AspNetCore.Mvc;
using glossaryApi.Data;
using glossaryApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using static glossaryApi.LanguageConfiguration;

namespace glossaryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LanguageController : BaseController
    {
        private readonly AppDbContext _context;

        public LanguageController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var languages = await _context.Languages.ToListAsync();
            return Ok(languages);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddLanguage(Languages language)
        {
            try
            {
                if (language == null || string.IsNullOrWhiteSpace(language.Name) || string.IsNullOrWhiteSpace(language.Code))
                {
                    return BadRequest("Language name and code are required.");
                }

                bool languageExists = await _context.Languages
                    .AnyAsync(l =>
                        l.Name.ToLower() == language.Name.ToLower() ||
                        l.Code.ToLower() == language.Code.ToLower());

                if (languageExists)
                {
                    return Conflict($"Language '{language.Name}' or code '{language.Code}' already exists.");
                }

                _context.Languages.Add(language);
                await _context.SaveChangesAsync();

                return Ok("Language added.");
            }
            catch (Exception ex)
            {
                return HandleError(ex, "adding language");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteLanguage(int id)
        {
            try
            {
                var language = await _context.Languages.FindAsync(id);
                if (language == null)
                {
                    return NotFound("Language not found.");
                }

                if (language.Code == LanguageConfiguration.BaseLanguageCode || language.Name == LanguageConfiguration.BaseLanguageName)
                {
                    return BadRequest($"Cannot delete the base language ({LanguageConfiguration.BaseLanguageName}).");
                }

                var translationsToDelete = await _context.Translations
                    .Where(t => t.LanguageCode == language.Code)
                    .ToListAsync();

                if (translationsToDelete.Any())
                {
                    _context.Translations.RemoveRange(translationsToDelete);
                }

                _context.Languages.Remove(language);
                await _context.SaveChangesAsync();

                var deletedTranslationsCount = translationsToDelete.Count;
                var message = deletedTranslationsCount > 0 
                    ? $"Language '{language.Name}' and {deletedTranslationsCount} associated translations deleted successfully."
                    : $"Language '{language.Name}' deleted successfully.";
                
                return Ok(message);
            }
            catch (Exception ex)
            {
                return HandleError(ex, "deleting language");
            }
        }
    }
}
