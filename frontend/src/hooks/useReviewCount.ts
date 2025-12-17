import { usePaginatedData } from './usePaginatedData';
import { ITranslation } from '../models/models';
import { translationsApi } from '../api/translationsApi';

interface UseReviewCountProps {
  languageCode?: string;
}

export const useReviewCount = ({ languageCode }: UseReviewCountProps = {}) => {
  const { pagination, loading, error } = usePaginatedData<ITranslation>({
    apiCall: translationsApi.getAll,
    dataKey: 'translations',
    params: {
      page: 1,
      pageSize: 1,
      status: 'Review',
      ...(languageCode && { languageCode }),
    },
  });

  return {
    count: pagination?.totalCount ?? 0,
    loading,
    error,
  };
};
