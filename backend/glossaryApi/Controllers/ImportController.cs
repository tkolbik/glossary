using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;
using glossaryApi.Data;
using glossaryApi.Models;
using glossaryApi.Utils;
using System.Text.Json.Serialization;
namespace glossaryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImportController : BaseController
    {
        private readonly AppDbContext _context;

        public ImportController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("terms")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportTerms(
            IFormFile file,
            [FromForm] string mapping,
            [FromForm] string? createdAt = null)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("File is missing or empty.");

                Dictionary<string, string>? columnMap;
                try
                {
                    columnMap = JsonSerializer.Deserialize<Dictionary<string, string>>(mapping);
                }
                catch (JsonException ex)
                {
                    return BadRequest("Invalid mapping format.", ex.Message);
                }

                if (columnMap == null)
                    return BadRequest("Invalid mapping.");

                var table = ExcelHelper.GetFirstWorksheet(file);
                var headers = ExcelHelper.ReadHeaders(table);

                ExcelHelper.RequireColumns(columnMap, headers, "Name");

                var importDate = DateTime.TryParse(createdAt, out var parsed)
                    ? DateTime.SpecifyKind(parsed, DateTimeKind.Utc)
                    : DateTime.UtcNow;

                var seenInExcel = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                var rawTerms = new List<Terms>();

                for (int i = 0; i < table.Rows.Count; i++)
                {
                    var row = table.Rows[i];

                    var name = ExcelHelper.ReadCell(
                        row, headers, "Name", columnMap);

                    if (string.IsNullOrWhiteSpace(name))
                        continue;

                    var normalizedName = TextUtils.CapitalizeFirstLetter(name);

                    if (!seenInExcel.Add(normalizedName))
                        continue;

                    rawTerms.Add(new Terms
                    {
                        Name = normalizedName,
                        Description = TextUtils.CapitalizeFirstLetter(
                            ExcelHelper.ReadCell(row, headers, "Description", columnMap)),
                        Reference = ExcelHelper.ReadCell(
                            row, headers, "Reference", columnMap),
                        CreatedAt = importDate
                    });
                }

                if (!rawTerms.Any())
                    return BadRequest("No valid terms found in Excel.");

                var termNames = rawTerms
                    .Select(t => t.Name)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var existingNames = await _context.Terms
                    .AsNoTracking()
                    .Where(t => termNames.Contains(t.Name))
                    .Select(t => t.Name)
                    .ToListAsync();

                var existingNamesSet = new HashSet<string>(
                    existingNames,
                    StringComparer.OrdinalIgnoreCase);

                var finalTerms = rawTerms
                    .Where(t => !existingNamesSet.Contains(t.Name))
                    .ToList();

                _context.Terms.AddRange(finalTerms);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"{finalTerms.Count} terms imported."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest("Invalid import file or mapping.", ex.Message);
            }
            catch (Exception ex)
            {
                return HandleError(ex, "importing terms");
            }
        }


        [HttpPost("translations")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportTranslations(
            IFormFile file,
            [FromForm] string mapping,
            [FromForm] string languageCode)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("No file provided.");

                if (string.IsNullOrWhiteSpace(languageCode))
                    return BadRequest("Language code is required.");

                Dictionary<string, string>? columnMap;
                try
                {
                    columnMap = JsonSerializer.Deserialize<Dictionary<string, string>>(mapping);
                }
                catch (JsonException ex)
                {
                    return BadRequest("Invalid mapping format.", ex.Message);
                }

                if (columnMap == null)
                    return BadRequest("Invalid mapping.");

                var table = ExcelHelper.GetFirstWorksheet(file);
                var headers = ExcelHelper.ReadHeaders(table);

                ExcelHelper.RequireColumns(columnMap, headers, "BaseLanguageName");

                var termsByName = await _context.Terms
                    .AsNoTracking()
                    .ToDictionaryAsync(
                        t => t.Name.ToLower(),
                        t => t
                    );

                var translations = new List<Translations>();
                var seenKeys = new HashSet<string>();

                for (int i = 0; i < table.Rows.Count; i++)
                {
                    var row = table.Rows[i];

                    var englishName = ExcelHelper.ReadCell(
                        row, headers, "BaseLanguageName", columnMap);

                    if (string.IsNullOrWhiteSpace(englishName))
                        continue;

                    if (!termsByName.TryGetValue(englishName.ToLower(), out var term))
                        continue;

                    var translatedName = ExcelHelper.ReadCell(
                        row, headers, "TranslatedName", columnMap);

                    var translatedDescription = ExcelHelper.ReadCell(
                        row, headers, "TranslatedDescription", columnMap);

                    if (string.IsNullOrWhiteSpace(translatedName) &&
                        string.IsNullOrWhiteSpace(translatedDescription))
                        continue;

                    var key = $"{term.TermId}_{languageCode}".ToLower();
                    if (!seenKeys.Add(key))
                        continue;

                    translations.Add(new Translations
                    {
                        TermId = term.TermId,
                        LanguageCode = languageCode,
                        Name = TextUtils.CapitalizeFirstLetter(translatedName),
                        Description = TextUtils.CapitalizeFirstLetter(translatedDescription),
                        CreatedAt = term.CreatedAt ?? DateTime.UtcNow
                    });
                }

                if (!translations.Any())
                    return BadRequest("No valid translations found in Excel.");

                var termIds = translations
                    .Select(t => t.TermId)
                    .Distinct()
                    .ToList();

                var existingKeys = await _context.Translations
                    .AsNoTracking()
                    .Where(t => t.LanguageCode == languageCode && termIds.Contains(t.TermId))
                    .Select(t => $"{t.TermId}_{t.LanguageCode}".ToLower())
                    .ToListAsync();

                var finalTranslations = translations
                    .Where(t => !existingKeys.Contains(
                        $"{t.TermId}_{t.LanguageCode}".ToLower()))
                    .ToList();

                _context.Translations.AddRange(finalTranslations);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"{finalTranslations.Count} translations imported for '{languageCode}'.",
                    skipped = translations.Count - finalTranslations.Count
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest("Invalid import file or mapping.", ex.Message);
            }
            catch (Exception ex)
            {
                return HandleError(ex, "importing translations");
            }
        }

    }
}
