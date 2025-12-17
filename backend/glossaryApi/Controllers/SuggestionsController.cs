using Microsoft.AspNetCore.Mvc;
using System.Linq;
using glossaryApi.Data;
using glossaryApi.Models;
using Microsoft.EntityFrameworkCore;
using glossaryApi.Dto;
using System.Text.Json;
using glossaryApi.Mappers;
using Microsoft.AspNetCore.Authorization;
using glossaryApi;
using glossaryApi.Services;
using glossaryApi.Enums;

namespace glossaryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuggestionsController : BaseController
    {
        private readonly AppDbContext _context;
        private readonly LanguageService _languageService;
        private readonly RateLimitingService _rateLimitingService;
        private readonly EmailNotificationService _emailNotificationService;
        private readonly IConfiguration _configuration;

        public SuggestionsController(AppDbContext context, LanguageService languageService, RateLimitingService rateLimitingService, EmailNotificationService emailNotificationService, IConfiguration configuration)
        {
            _context = context;
            _languageService = languageService;
            _rateLimitingService = rateLimitingService;
            _emailNotificationService = emailNotificationService;
            _configuration = configuration;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Get()
        {
            var suggestions = await _context.Suggestions.ToListAsync();

            var terms = await _context.Terms
                .Where(t => suggestions.Select(s => s.TermId).Contains(t.TermId))
                .ToListAsync();

            var translations = await _context.Translations
                .Where(tr => suggestions.Select(s => s.TermId).Contains(tr.TermId))
                .ToListAsync();

            var result = suggestions.Select(s =>
            {
                string termName;

                if (s.TermId is null)
                {
                    termName = s.SuggestedName ?? "[Unknown]";
                }
                else if (_languageService.IsBaseLanguage(s.LanguageCode))
                {
                    termName = terms.FirstOrDefault(t => t.TermId == s.TermId)?.Name ?? "[Unknown]";
                }
                else
                {
                    termName = translations
                        .FirstOrDefault(tr => tr.TermId == s.TermId && tr.LanguageCode == s.LanguageCode)
                        ?.Name ?? "[Unknown]";
                }

                return new SuggestionResponseDto
                {
                    SuggestionId = s.SuggestionId,
                    TermId = s.TermId,
                    LanguageCode = s.LanguageCode,
                    TermName = termName,
                    SuggestedName = s.SuggestedName,
                    Description = s.Description,
                    Reference = s.Reference,
                    Reasoning = s.Reasoning,
                    Fullname = s.Fullname,
                    Email = s.Email
                };
            });

            return Ok(result);
        }

        [HttpPost("approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveSuggestion([FromBody] SuggestionApproveDto request)
        {
            try
            {
                bool isNew = request.TermId == null;
                int termId;

                if (isNew)
                {
                    var term = new Terms
                    {
                        Name = request.SuggestedName!,
                        Description = request.Description,
                        Reference = request.Reference,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Terms.Add(term);
                    await _context.SaveChangesAsync();
                    termId = term.TermId;
                }
                else
                {
                    termId = request.TermId.Value;
                    
                    if (_languageService.IsBaseLanguage(request.LanguageCode))
                    {
                        var existingTerm = await _context.Terms.FindAsync(termId);
                        if (existingTerm != null)
                        {
                            existingTerm.Name = request.SuggestedName ?? existingTerm.Name;
                            existingTerm.Description = request.Description;
                            existingTerm.Reference = request.Reference;
                        }
                    }
                    else
                    {
                        var existingTranslation = await _context.Translations
                            .FirstOrDefaultAsync(t => t.TermId == termId && t.LanguageCode == request.LanguageCode);
                        
                        if (existingTranslation != null)
                        {
                            existingTranslation.Name = request.SuggestedName ?? existingTranslation.Name;
                            existingTranslation.Description = request.Description;
                        }
                        else
                        {
                            var newTranslation = new Translations
                            {
                                TermId = termId,
                                LanguageCode = request.LanguageCode,
                                Name = request.SuggestedName ?? "",
                                Description = request.Description
                            };
                            _context.Translations.Add(newTranslation);
                        }
                    }
                }

                var relatedTranslations = await _context.Translations
                    .Where(t => t.TermId == termId)
                    .ToListAsync();
                
                foreach (var translation in relatedTranslations)
                {
                    translation.Status = TranslationStatus.Review;
                }

                var existing = await _context.Suggestions.FindAsync(request.SuggestionId);
                if (existing != null)
                {
                    _context.Suggestions.Remove(existing);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Suggestion approved", termId });
            }
            catch (Exception ex)
            {
                return HandleError(ex, "approving suggestion");
            }
        }


        [HttpPost]
        public async Task<IActionResult> Post([FromBody] SuggestionSubmitDto request)
        {
            try
            {
                var clientIp = GetClientIpAddress();
                
                if (!_rateLimitingService.IsAllowed(clientIp))
                {
                    var remainingRequests = _rateLimitingService.GetRemainingRequests(clientIp);
                    var nextAllowedTime = _rateLimitingService.GetNextAllowedTime(clientIp);
                    
                    return StatusCode(429, new { 
                        message = "Rate limit exceeded. Maximum 10 suggestions per hour allowed.",
                        remainingRequests = remainingRequests,
                        nextAllowedTime = nextAllowedTime?.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        retryAfter = nextAllowedTime?.Subtract(DateTime.UtcNow).TotalSeconds
                    });
                }

                var secret = _configuration.GetSection("CAPTCHA_SECRET_KEY").Value 
                    ?? _configuration.GetValue<string>("CAPTCHA_SECRET_KEY");
                
                if (string.IsNullOrWhiteSpace(secret))
                    return HandleError(new InvalidOperationException("Captcha secret key not configured"), "submitting suggestion", 500);

                var verifyUrl = $"https://www.google.com/recaptcha/api/siteverify?secret={secret}&response={request.CaptchaToken}";
                using var http = new HttpClient();
                var response = await http.PostAsync(verifyUrl, null);
                var body = await response.Content.ReadAsStringAsync();
                var json = JsonDocument.Parse(body);
                var success = json.RootElement.GetProperty("success").GetBoolean();

                if (!success)
                {
                    return BadRequest("CAPTCHA validation failed");
                }

                var suggestionEntity = request.FromDto();
                _context.Suggestions.Add(suggestionEntity);
                await _context.SaveChangesAsync();
                _ = _emailNotificationService.NotifySuggestionSubmittedAsync(suggestionEntity);

                var remainingAfterSubmit = _rateLimitingService.GetRemainingRequests(clientIp);
                
                return Ok(new { 
                    message = "Added successfully",
                    remainingRequests = remainingAfterSubmit
                });
            }
            catch(Exception ex)
            {
                return HandleError(ex, "submitting suggestion");
            }
        }

        private string GetClientIpAddress()
        {
            var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                var firstIp = forwardedFor.Split(',')[0].Trim();
                if (!string.IsNullOrEmpty(firstIp))
                    return firstIp;
            }

            var realIp = Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
                return realIp;

            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        [HttpGet("rate-limit-status")]
        public IActionResult GetRateLimitStatus()
        {
            var clientIp = GetClientIpAddress();
            var remainingRequests = _rateLimitingService.GetRemainingRequests(clientIp);
            var nextAllowedTime = _rateLimitingService.GetNextAllowedTime(clientIp);
            
            return Ok(new
            {
                remainingRequests = remainingRequests,
                nextAllowedTime = nextAllowedTime?.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                retryAfter = nextAllowedTime?.Subtract(DateTime.UtcNow).TotalSeconds
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var suggestion = await _context.Suggestions.FindAsync(id);
            if (suggestion == null)
            {
                return NotFound("Suggestion not found.");
            }

            _context.Suggestions.Remove(suggestion);
            await _context.SaveChangesAsync();
            return Ok("Deleted Successfully");
        }
    }
}
