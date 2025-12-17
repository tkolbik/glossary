using System;
using System.Collections.Generic;
using System.Linq;
using static glossaryApi.LanguageConfiguration;

namespace glossaryApi.Utils
{
    public static class LanguageUtils
    {
        public static readonly IReadOnlyDictionary<string, string> LanguageNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [LanguageConfiguration.BaseLanguageCode] = LanguageConfiguration.BaseLanguageName,
            ["US"] = "American English",
            ["DE"] = "German",
            ["FR"] = "French",
            ["ES"] = "Spanish",
            ["IT"] = "Italian",
            ["PL"] = "Polish",
            ["CZ"] = "Czech",
            ["SK"] = "Slovak",
            ["NL"] = "Dutch",
            ["PT"] = "Portuguese",
            ["BR"] = "Portuguese (Brazil)",
            ["RU"] = "Russian",
            ["UA"] = "Ukrainian",
            ["TR"] = "Turkish",
            ["RO"] = "Romanian",
            ["HU"] = "Hungarian",
            ["SE"] = "Swedish",
            ["NO"] = "Norwegian",
            ["FI"] = "Finnish",
            ["DK"] = "Danish",
            ["GR"] = "Greek",
            ["BG"] = "Bulgarian",
            ["HR"] = "Croatian",
            ["RS"] = "Serbian",
            ["SI"] = "Slovenian",
            ["JP"] = "Japanese",
            ["CN"] = "Chinese (Simplified)",
            ["TW"] = "Chinese (Traditional)",
            ["KR"] = "Korean",
            ["TH"] = "Thai",
            ["VN"] = "Vietnamese",
            ["ID"] = "Indonesian",
            ["IN"] = "Hindi",
            ["IL"] = "Hebrew",
            ["IR"] = "Persian",
            ["PK"] = "Urdu",
            ["MY"] = "Malay",
            ["PH"] = "Filipino",
            ["ZA"] = "Afrikaans",
            ["EG"] = "Arabic (Egypt)",
            ["CA"] = "English (Canada)",
            ["AU"] = "English (Australia)",
            ["NZ"] = "English (New Zealand)",
            ["MX"] = "Spanish (Mexico)"
        };

        public static string? GetCodeByName(string languageName)
        {
            if (string.IsNullOrWhiteSpace(languageName))
                return null;

            var kvp = LanguageNames.FirstOrDefault(x =>
                string.Equals(x.Value, languageName, StringComparison.OrdinalIgnoreCase));

            return string.IsNullOrEmpty(kvp.Key) ? null : kvp.Key;
        }
    }
}