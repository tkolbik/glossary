using System.ComponentModel.DataAnnotations;

namespace glossaryApi.Models
{
    public class Languages
    {
        [Key]
        public int LanguageId { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }
}