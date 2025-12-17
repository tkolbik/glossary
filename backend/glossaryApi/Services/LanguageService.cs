using glossaryApi;
using glossaryApi.Data;
using Microsoft.EntityFrameworkCore;

namespace glossaryApi.Services
{
    public class LanguageService
    {
        private readonly AppDbContext _context;

        public LanguageService(AppDbContext context)
        {
            _context = context;
        }

        public bool IsBaseLanguage(string languageCode)
        {
            return LanguageConfiguration.IsBaseLanguage(languageCode);
        }

        public bool IsTranslationLanguage(string languageCode)
        {
            return LanguageConfiguration.IsTranslationLanguage(languageCode);
        }

        public async Task<bool> HasTranslationAsync(int termId, string languageCode)
        {
            if (IsBaseLanguage(languageCode))
                return await _context.Terms.AnyAsync(t => t.TermId == termId);
            
            return await _context.Translations
                .AnyAsync(t => t.TermId == termId && t.LanguageCode == languageCode);
        }

        public async Task<string?> GetTermNameAsync(int termId, string languageCode)
        {
            if (IsBaseLanguage(languageCode))
            {
                var term = await _context.Terms.FindAsync(termId);
                return term?.Name;
            }
            
            var translation = await _context.Translations
                .FirstOrDefaultAsync(t => t.TermId == termId && t.LanguageCode == languageCode);
            return translation?.Name;
        }

        public async Task<string?> GetTermDescriptionAsync(int termId, string languageCode)
        {
            if (IsBaseLanguage(languageCode))
            {
                var term = await _context.Terms.FindAsync(termId);
                return term?.Description;
            }
            
            var translation = await _context.Translations
                .FirstOrDefaultAsync(t => t.TermId == termId && t.LanguageCode == languageCode);
            return translation?.Description;
        }

        public async Task<string?> GetTermReferenceAsync(int termId, string languageCode)
        {
            if (IsBaseLanguage(languageCode))
            {
                var term = await _context.Terms.FindAsync(termId);
                return term?.Reference;
            }
            
            var baseTerm = await _context.Terms.FindAsync(termId);
            return baseTerm?.Reference;
        }
    }
}
