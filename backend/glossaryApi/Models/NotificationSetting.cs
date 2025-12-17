namespace glossaryApi.Models
{
    public class NotificationSetting
    {
        public int NotificationSettingId { get; set; }
        public string? SuggestionNotificationEmail { get; set; }
        public string? SenderEmail { get; set; }
        public string? MailjetApiKey { get; set; }
        public string? MailjetApiSecret { get; set; }
    }
}

