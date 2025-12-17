namespace glossaryApi.Dto
{
    public class SuggestionBaseDto
    {
        public int? TermId { get; set; }
        public string LanguageCode { get; set; }
        public string? SuggestedName { get; set; }
        public string Fullname { get; set; }
        public string Reasoning { get; set; }
        public string Reference { get; set; }
        public string Description { get; set; }
        public string Email { get; set; }
    }

    public class SuggestionSubmitDto : SuggestionBaseDto
    {
        public string CaptchaToken { get; set; } = string.Empty;
    }

    public class SuggestionResponseDto : SuggestionBaseDto
    {
        public int SuggestionId { get; set; }
        public string TermName { get; set; } = string.Empty;
    }

    public class SuggestionApproveDto : SuggestionBaseDto
    {
        public int SuggestionId { get; set; }
    }
}
