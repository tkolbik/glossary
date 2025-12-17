using glossaryApi.Enums;
using System.ComponentModel.DataAnnotations;

namespace glossaryApi.Models
{
    public class Translations
    {
        [Key]
        public int TranslationId { get; set; }
        public int TermId { get; set; }
        public string LanguageCode { get; set; }
        public string Description { get; set; }
        public string Name { get; set; }
        public DateTime? CreatedAt { get; set; }
        public Terms Term { get; set; }
        public TranslationStatus Status { get; set; } = TranslationStatus.Consistent;
    }
}