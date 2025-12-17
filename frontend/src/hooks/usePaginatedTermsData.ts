import { ITerm } from '../models/models';
import { usePaginatedData } from './usePaginatedData';
import { termsApi } from '../api/termsApi';

interface UsePaginatedTermsDataProps {
  page: number;
  pageSize: number;
  search?: string;
  letter?: string;
  languageCode?: string;
  tags?: string;
}

export const usePaginatedTermsData = (params: UsePaginatedTermsDataProps) => {
  const result = usePaginatedData<ITerm>({
    apiCall: termsApi.getAll,
    dataKey: 'terms',
    params,
  });

  return {
    terms: result.data,
    pagination: result.pagination,
    loading: result.loading,
    error: result.error,
  };
};
