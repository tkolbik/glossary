import { ITranslation } from '../models/models';
import { usePaginatedData } from './usePaginatedData';
import { translationsApi } from '../api/translationsApi';

interface UsePaginatedTranslationsDataProps {
  page: number;
  pageSize: number;
  search?: string;
  letter?: string;
  languageCode?: string;
  status?: string;
}

export const usePaginatedTranslationsData = (
  params: UsePaginatedTranslationsDataProps
) => {
  const result = usePaginatedData<ITranslation>({
    apiCall: translationsApi.getAll,
    dataKey: 'translations',
    params,
  });

  return {
    translations: result.data,
    pagination: result.pagination,
    loading: result.loading,
    error: result.error,
  };
};
