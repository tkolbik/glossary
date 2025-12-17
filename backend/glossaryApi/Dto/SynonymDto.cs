using System.ComponentModel.DataAnnotations;

namespace glossaryApi.Dto
{
    public class SynonymDto
    {
        [Key]
        public int SynonymId { get; set; }
        public int TermId { get; set; }
        public int SynonymTermId { get; set; }
        public DateTime? CreatedAt { get; set; }
        
        public string? SynonymTermName { get; set; }
        public string? SynonymTermDescription { get; set; }
    }
    
    public class CreateSynonymDto
    {
        public int TermId { get; set; }
        public int SynonymTermId { get; set; }
    }
}
