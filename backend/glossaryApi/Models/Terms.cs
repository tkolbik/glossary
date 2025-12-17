using System.ComponentModel.DataAnnotations;

namespace glossaryApi.Models
{
    public class Terms
    {
        [Key]
        public int TermId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public string Reference { get; set; }

        public DateTime? CreatedAt { get; set; }

        public List<TagsContract>? TagContract { get; set; }
    }
}