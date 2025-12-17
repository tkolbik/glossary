namespace glossaryApi.Utils
{
    public static class TextUtils
    {
        public static string CapitalizeFirstLetter(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            var trimmed = value.Trim();

            if (trimmed.Length == 0)
            {
                return string.Empty;
            }

            var firstChar = char.ToUpper(trimmed[0]);
            if (trimmed.Length == 1)
            {
                return firstChar.ToString();
            }

            return firstChar + trimmed[1..];
        }
    }
}


