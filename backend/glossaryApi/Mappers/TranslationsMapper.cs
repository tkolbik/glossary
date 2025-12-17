using glossaryApi.Dto;
using glossaryApi.Models;
using glossaryApi.Enums;
using glossaryApi.Utils;

namespace glossaryApi.Mappers
{
    public static class TranslationMapper
    {
        public static TranslationDto ToDto(this Translations translation)
        {
            return new TranslationDto
            {
                TermId = translation.TermId,
                LanguageCode = translation.LanguageCode,
                Description = translation.Description,
                Name = translation.Name,
                BaseName = translation.Term?.Name ?? "",
                Status = translation.Status.ToString(),
                CreatedAt = translation.CreatedAt
            };
        }

        public static Translations FromDto(TranslationDto dto)
        {
            return new Translations
            {
                TermId = dto.TermId,
                LanguageCode = dto.LanguageCode,
                Description = TextUtils.CapitalizeFirstLetter(dto.Description),
                Name = TextUtils.CapitalizeFirstLetter(dto.Name),
                Status = string.IsNullOrEmpty(dto.Status) ? TranslationStatus.Consistent : Enum.Parse<TranslationStatus>(dto.Status)
            };
        }
    }
}



