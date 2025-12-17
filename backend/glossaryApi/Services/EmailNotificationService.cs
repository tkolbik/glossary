using System;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using glossaryApi.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
namespace glossaryApi.Services
{
    public class EmailNotificationService
    {
        private static readonly Uri MailjetEndpoint = new("https://api.mailjet.com/v3.1/send");

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<EmailNotificationService> _logger;

        public EmailNotificationService(
            IServiceScopeFactory scopeFactory,
            IHttpClientFactory httpClientFactory,
            ILogger<EmailNotificationService> logger)
        {
            _scopeFactory = scopeFactory;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task NotifySuggestionSubmittedAsync(Suggestions suggestion)
        {
            using var scope = _scopeFactory.CreateScope();
            var settingsService =
                scope.ServiceProvider.GetRequiredService<NotificationSettingsService>();
            var settings = await settingsService.GetNotificationSettingsAsync();
            var recipient = settings.SuggestionNotificationEmail;
            if (string.IsNullOrWhiteSpace(recipient))
            {
                return;
            }

            var apiKey = settings.MailjetApiKey;
            var apiSecret = settings.MailjetApiSecret;
            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
            {
                _logger.LogInformation("Mailjet credentials are not configured. Skipping email delivery.");
                return;
            }

            var payload = new
            {
                Messages = new[]
                {
                    new
                    {
                        From = new { Email = settings.SenderEmail, Name = "Glossary App" },
                        To = new[] { new { Email = recipient } },
                        Subject = "New glossary suggestion received",
                        TextPart = BuildEmailBody(suggestion)
                    }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, MailjetEndpoint)
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };

            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{apiKey}:{apiSecret}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var response = await httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Mailjet notification failed with {StatusCode}: {Body}", response.StatusCode, body);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification for suggestion {SuggestionId}.", suggestion.SuggestionId);
            }
        }

        private static string BuildEmailBody(Suggestions suggestion)
        {
            var builder = new StringBuilder();
            builder.AppendLine("A new glossary suggestion was submitted.");
            builder.AppendLine();

            builder.AppendLine($"Language Code: {suggestion.LanguageCode}");

            if (!string.IsNullOrWhiteSpace(suggestion.SuggestedName))
            {
                builder.AppendLine($"Suggested Name: {suggestion.SuggestedName}");
            }

            if (!string.IsNullOrWhiteSpace(suggestion.Description))
            {
                builder.AppendLine($"Description: {suggestion.Description}");
            }

            if (!string.IsNullOrWhiteSpace(suggestion.Reference))
            {
                builder.AppendLine($"Reference: {suggestion.Reference}");
            }

            if (!string.IsNullOrWhiteSpace(suggestion.Reasoning))
            {
                builder.AppendLine($"Reasoning: {suggestion.Reasoning}");
            }

            if (!string.IsNullOrWhiteSpace(suggestion.Fullname))
            {
                builder.AppendLine($"Fullname: {suggestion.Fullname}");
            }

            if (!string.IsNullOrWhiteSpace(suggestion.Email))
            {
                builder.AppendLine($"Contributor Email: {suggestion.Email}");
            }

            return builder.ToString();
        }
    }
}
