using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using glossaryApi.Services;
using glossaryApi.Dto;
using System.Threading.Tasks;

namespace glossaryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SettingsController : BaseController
    {
        private readonly NotificationSettingsService _notificationSettingsService;

        public SettingsController(NotificationSettingsService notificationSettingsService)
        {
            _notificationSettingsService = notificationSettingsService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var settings = await _notificationSettingsService.GetNotificationSettingsAsync();
                return Ok(new NotificationSettingsDto
                {
                    Email = settings.SuggestionNotificationEmail,
                    SenderEmail = settings.SenderEmail,
                    MailjetApiKey = settings.MailjetApiKey,
                    MailjetApiSecret = settings.MailjetApiSecret,
                });
            }
            catch (Exception ex)
            {
                return HandleError(ex, "retrieving notification settings");
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] NotificationSettingsDto request)
        {
            try
            {
                await _notificationSettingsService.UpdateNotificationSettingsAsync(
                    request.Email,
                    request.SenderEmail,
                    request.MailjetApiKey,
                    request.MailjetApiSecret);
                return Ok(new { message = "Notification settings updated" });
            }
            catch (Exception ex)
            {
                return HandleError(ex, "updating notification settings");
            }
        }
    }
}

