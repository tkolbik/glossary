using System.Collections.Concurrent;
using System.Collections.Generic;

namespace glossaryApi.Services
{
    public class RateLimitingService
    {
        private readonly ConcurrentDictionary<string, List<DateTime>> _userRequests = new();
        private readonly int _maxRequests;
        private readonly TimeSpan _timeWindow;

        public RateLimitingService(int maxRequests = 10, TimeSpan? timeWindow = null)
        {
            _maxRequests = maxRequests;
            _timeWindow = timeWindow ?? TimeSpan.FromHours(1);
        }

        public bool IsAllowed(string userIdentifier)
        {
            var now = DateTime.UtcNow;
            var cutoffTime = now - _timeWindow;

            var userRequests = _userRequests.GetOrAdd(userIdentifier, _ => new List<DateTime>());

            lock (userRequests)
            {
                userRequests.RemoveAll(requestTime => requestTime < cutoffTime);

                if (userRequests.Count >= _maxRequests)
                {
                    return false;
                }

                userRequests.Add(now);
                return true;
            }
        }

        public int GetRemainingRequests(string userIdentifier)
        {
            var now = DateTime.UtcNow;
            var cutoffTime = now - _timeWindow;

            var userRequests = _userRequests.GetOrAdd(userIdentifier, _ => new List<DateTime>());

            lock (userRequests)
            {
                userRequests.RemoveAll(requestTime => requestTime < cutoffTime);

                return Math.Max(0, _maxRequests - userRequests.Count);
            }
        }

        public DateTime? GetNextAllowedTime(string userIdentifier)
        {
            var now = DateTime.UtcNow;
            var cutoffTime = now - _timeWindow;

            var userRequests = _userRequests.GetOrAdd(userIdentifier, _ => new List<DateTime>());

            lock (userRequests)
            {
                userRequests.RemoveAll(requestTime => requestTime < cutoffTime);

                if (userRequests.Count < _maxRequests)
                {
                    return null;
                }

                var oldestRequest = userRequests.OrderBy(r => r).FirstOrDefault();
                return oldestRequest + _timeWindow;
            }
        }

        public void Cleanup()
        {
            var now = DateTime.UtcNow;
            var cutoffTime = now - _timeWindow;

            foreach (var kvp in _userRequests.ToList())
            {
                var userRequests = kvp.Value;
                lock (userRequests)
                {
                    userRequests.RemoveAll(requestTime => requestTime < cutoffTime);
                    
                    if (userRequests.Count == 0)
                    {
                        _userRequests.TryRemove(kvp.Key, out _);
                    }
                }
            }
        }
    }
}

