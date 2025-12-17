using glossaryApi.Dto;
using glossaryApi.Models;
using glossaryApi;
using glossaryApi.Utils;

namespace glossaryApi.Mappers
{
    public static class TermsMapper
    {
        public static TermsDto ToDto(this Terms term)
        {
            return new TermsDto
            {
                TermId = term.TermId,
                Name = term.Name,
                Description = term.Description,
                Reference = term.Reference,
                LanguageCode = LanguageConfiguration.BaseLanguageCode,
                CreatedAt = term.CreatedAt,
                Tags = term.TagContract?.Select(tc => new TagDto
                {
                    TagId = tc.Tag.TagId,
                    Name = tc.Tag.Name
                }).ToList() ?? new()
            };
        }

        public static Terms FromDto(this TermsDto dto, List<Tags> existingTags)
        {
            return new Terms
            {
                TermId = dto.TermId,
                Name = TextUtils.CapitalizeFirstLetter(dto.Name),
                Description = TextUtils.CapitalizeFirstLetter(dto.Description),
                Reference = dto.Reference,
                TagContract = existingTags
                    .Select(tag => new TagsContract
                    {
                        TagId = tag.TagId,
                        Tag = tag
                    })
                    .ToList()
            };
        }

        public static TermsDto ToDto(this Translations translation)
        {
            return new TermsDto
            {
                TermId = translation.TermId,
                Name = translation.Name,
                Description = translation.Description,
                Reference = translation.Term?.Reference ?? "",
                LanguageCode = translation.LanguageCode,
                BaseName = translation.Term?.Name ?? "",
                CreatedAt = translation.CreatedAt,
                Tags = translation.Term?.TagContract?.Select(tc => new TagDto
                {
                    TagId = tc.Tag.TagId,
                    Name = tc.Tag.Name
                }).ToList() ?? new()
            };
        }
    }
}



