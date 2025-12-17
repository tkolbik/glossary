namespace glossaryApi.Dto
{
    public class TranslationDto
    {
        public int TermId { get; set; }
        public string LanguageCode { get; set; }
        public string Description { get; set; }
        public string Name { get; set; }
        public string? BaseName { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class TranslationReviewDto
    {
        public int TermId { get; set; }
        public string LanguageCode { get; set; } 
    }
}
