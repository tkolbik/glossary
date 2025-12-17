using System;

namespace glossaryApi
{
    public static class LanguageConfiguration
    {
        public const string BaseLanguageCode = "GB";
        public const string BaseLanguageName = "English";
        
        public static class LanguageTypes
        {
            public const string Base = "Base";
            public const string Translation = "Translation";
        }
        
        public static bool IsBaseLanguage(string languageCode)
        {
            return string.Equals(languageCode, BaseLanguageCode, StringComparison.OrdinalIgnoreCase);
        }
        
        public static bool IsTranslationLanguage(string languageCode)
        {
            return !IsBaseLanguage(languageCode);
        }
        
        public static string GetLanguageType(string languageCode)
        {
            return IsBaseLanguage(languageCode) ? LanguageTypes.Base : LanguageTypes.Translation;
        }
    }
}
