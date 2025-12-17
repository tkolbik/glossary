import { useMemo } from 'react';
import { ITerm } from '../models/models';
import { usePaginatedData } from './usePaginatedData';
import { translationsApi } from '../api/translationsApi';

interface UsePaginatedUntranslatedDataProps {
  page: number;
  pageSize: number;
  search?: string;
  languageCode?: string;
}

export const usePaginatedUntranslatedData = (
  params: UsePaginatedUntranslatedDataProps
) => {
  const hasLanguage = Boolean(params.languageCode);

  const apiCall = useMemo(
    () => (paginationParams?: any) => {
      if (!hasLanguage) {
        return Promise.resolve({
          data: { terms: [], pagination: null },
        } as any);
      }

      return translationsApi.getUntranslated(
        params.languageCode!,
        paginationParams
      );
    },
    [hasLanguage, params.languageCode]
  );

  const result = usePaginatedData<ITerm>({
    apiCall,
    dataKey: 'terms',
    params: {
      page: params.page,
      pageSize: params.pageSize,
      languageCode: params.languageCode,
      ...(hasLanguage && params.search && { search: params.search }),
    },
  });

  return {
    terms: hasLanguage ? result.data : [],
    pagination: hasLanguage ? result.pagination : null,
    loading: hasLanguage ? result.loading : false,
    error: hasLanguage ? result.error : null,
  };
};

