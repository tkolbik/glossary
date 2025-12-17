using glossaryApi.Dto;
using glossaryApi.Models;
namespace glossaryApi.Mappers
{
    public static class SuggestionsMapper
    {
        public static Suggestions FromDto(this SuggestionSubmitDto suggestion)
        {
            return new Suggestions()
            {
                TermId = suggestion.TermId,
                SuggestedName = suggestion.SuggestedName,
                LanguageCode = suggestion.LanguageCode,
                Fullname = suggestion.Fullname,
                Reasoning = suggestion.Reasoning,
                Reference = suggestion.Reference,
                Description = suggestion.Description,
                Email = suggestion.Email
            };
        }
    }
}



