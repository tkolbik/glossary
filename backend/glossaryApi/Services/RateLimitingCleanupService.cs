using glossaryApi.Services;

namespace glossaryApi.Services
{
    public class RateLimitingCleanupService : BackgroundService
    {
        private readonly RateLimitingService _rateLimitingService;
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(5);

        public RateLimitingCleanupService(RateLimitingService rateLimitingService)
        {
            _rateLimitingService = rateLimitingService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _rateLimitingService.Cleanup();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Rate limiting cleanup error: {ex.Message}");
                }

                await Task.Delay(_cleanupInterval, stoppingToken);
            }
        }
    }
}

