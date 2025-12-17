using System.Threading.Tasks;
using glossaryApi.Data;
using glossaryApi.Models;

namespace glossaryApi.Services
{
    public class NotificationSettingsService
    {
        private readonly AppDbContext _context;
        private const int DefaultSettingsId = 1;

        public NotificationSettingsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationSetting> GetNotificationSettingsAsync()
        {
            return await GetOrCreateSettingsAsync();
        }

        public async Task<string?> GetNotificationEmailAsync()
        {
            var settings = await GetOrCreateSettingsAsync();
            return string.IsNullOrWhiteSpace(settings.SuggestionNotificationEmail)
                ? null
                : settings.SuggestionNotificationEmail;
        }

        public async Task UpdateNotificationSettingsAsync(string? email, string? senderEmail, string? mailjetApiKey, string? mailjetApiSecret)
        {
            var settings = await GetOrCreateSettingsAsync();
            settings.SuggestionNotificationEmail = Normalize(email);
            settings.SenderEmail = Normalize(senderEmail);
            settings.MailjetApiKey = Normalize(mailjetApiKey);
            settings.MailjetApiSecret = Normalize(mailjetApiSecret);

            await _context.SaveChangesAsync();
        }

        public async Task SetNotificationEmailAsync(string? email)
        {
            var settings = await GetOrCreateSettingsAsync();
            settings.SuggestionNotificationEmail = Normalize(email);

            await _context.SaveChangesAsync();
        }

        private static string? Normalize(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private async Task<NotificationSetting> GetOrCreateSettingsAsync()
        {
            var settings = await _context.NotificationSetting.FindAsync(DefaultSettingsId);
            if (settings != null)
            {
                return settings;
            }

            var newSettings = new NotificationSetting
            {
                NotificationSettingId = DefaultSettingsId
            };

            _context.NotificationSetting.Add(newSettings);
            await _context.SaveChangesAsync();
            return newSettings;
        }
    }
}

