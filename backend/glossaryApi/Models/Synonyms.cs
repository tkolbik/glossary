using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace glossaryApi.Models
{
    public class Synonyms
    {
        [Key]
        public int SynonymId { get; set; }
        
        public int TermId { get; set; }
        
        public int SynonymTermId { get; set; }
        
        public DateTime? CreatedAt { get; set; }
        
        public Terms Term { get; set; }
        
        public Terms SynonymTerm { get; set; }
    }
}
