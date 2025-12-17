using glossaryApi.Models;
using System.ComponentModel.DataAnnotations;

namespace glossaryApi.Dto
{
    public class TermsDto
    {
        [Key]
        public int TermId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Reference { get; set; }
        public string? LanguageCode { get; set; }
        public string? BaseName { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<TagDto> Tags { get; set; }
    }
}
