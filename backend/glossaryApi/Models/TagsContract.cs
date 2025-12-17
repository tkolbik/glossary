namespace glossaryApi.Models
{
    public class TagsContract
    {
        public int TagId { get; set; }
        public Tags Tag { get; set; }

        public int TermId { get; set; }
        public Terms Term { get; set; }
    }
}