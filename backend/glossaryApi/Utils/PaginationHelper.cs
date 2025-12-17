using System;
using System.Collections.Generic;
using System.Linq;

namespace glossaryApi.Utils
{
    public static class PaginationHelper
    {
        public static Dictionary<string, object> CreatePagedResponse<T>(
            IEnumerable<T> data,
            int page,
            int pageSize,
            int totalCount,
            string dataKey)
        {
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return new Dictionary<string, object>
            {
                [dataKey] = data,
                ["pagination"] = new
                {
                    currentPage = page,
                    pageSize,
                    totalCount,
                    totalPages,
                    hasNextPage = page < totalPages,
                    hasPreviousPage = page > 1
                }
            };
        }
    }
}


