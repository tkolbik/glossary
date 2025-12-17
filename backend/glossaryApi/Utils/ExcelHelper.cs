using ExcelDataReader;
using Microsoft.AspNetCore.Http;
using System.Data;

namespace glossaryApi.Utils
{
    public static class ExcelHelper
    {
        public static DataTable GetFirstWorksheet(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Excel file is missing or empty.");

            using var stream = file.OpenReadStream();
            using var reader = ExcelReaderFactory.CreateReader(stream);

            var dataSet = reader.AsDataSet(new ExcelDataSetConfiguration
            {
                ConfigureDataTable = _ => new ExcelDataTableConfiguration
                {
                    UseHeaderRow = true
                }
            });

            var table = dataSet.Tables.Cast<DataTable>().FirstOrDefault();

            if (table == null || table.Columns.Count == 0)
                throw new ArgumentException("Excel worksheet is empty.");

            return table;
        }

        public static Dictionary<string, int> ReadHeaders(DataTable table)
        {
            var headers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            for (int i = 0; i < table.Columns.Count; i++)
            {
                var header = table.Columns[i].ColumnName.Trim();

                if (!string.IsNullOrWhiteSpace(header))
                {
                    headers[header] = i;
                }
            }

            if (headers.Count == 0)
                throw new ArgumentException("Excel file does not contain any headers.");

            return headers;
        }

        public static void RequireColumns(
            Dictionary<string, string> mapping,
            Dictionary<string, int> headers,
            params string[] requiredKeys)
        {
            foreach (var key in requiredKeys)
            {
                if (!mapping.TryGetValue(key, out var headerName))
                    throw new ArgumentException($"Mapping for '{key}' is missing.");

                if (!headers.ContainsKey(headerName))
                    throw new ArgumentException(
                        $"Mapped column '{headerName}' for '{key}' was not found in Excel headers."
                    );
            }
        }

        public static string? ReadCell(
            DataRow row,
            Dictionary<string, int> headers,
            string mapKey,
            Dictionary<string, string> mapping)
        {
            if (!mapping.TryGetValue(mapKey, out var headerName))
                return null;

            if (!headers.TryGetValue(headerName, out var columnIndex))
                return null;

            var value = row[columnIndex];

            if (value == DBNull.Value)
                return null;

            return value.ToString()?.Trim();
        }

        public static string ReadCellRequired(
            DataRow row,
            int rowIndex,
            Dictionary<string, int> headers,
            string mapKey,
            Dictionary<string, string> mapping)
        {
            var value = ReadCell(row, headers, mapKey, mapping);

            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException(
                    $"Required value '{mapKey}' is missing at row {rowIndex}."
                );

            return value;
        }
    }
}
