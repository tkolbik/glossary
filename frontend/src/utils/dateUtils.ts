type MonthFormat = 'short' | 'long' | 'numeric' | '2-digit';

export const formatDate = (
  dateString: string | undefined,
  monthFormat: MonthFormat = 'short'
): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: monthFormat,
    day: 'numeric'
  });
};

export const formatFullDate = (dateString: string | undefined): string => {
  return formatDate(dateString, 'long');
};

