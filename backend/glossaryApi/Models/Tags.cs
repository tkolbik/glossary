
using System.ComponentModel.DataAnnotations;

namespace glossaryApi.Models
{
    public class Tags
    {
        [Key]
        public int TagId { get; set; }
        public string Name { get; set; }

        public List<TagsContract>? TagContract { get; set; }
    }
}