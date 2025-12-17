using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace glossaryApi.Models
{
    public class Suggestions
    {
        [Key]
        public int SuggestionId { get; set; }
        public int? TermId { get; set; }
        public string? SuggestedName { get; set; }
        public string LanguageCode { get; set; } 
        public string Description { get; set; }
        public string Reference { get; set; }
        public string Reasoning { get; set; }
        public string Fullname { get; set; }
        public string Email { get; set; }
    }
}