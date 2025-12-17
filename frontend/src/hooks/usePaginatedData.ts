import useSWR from 'swr';
import { AxiosPromise } from 'axios';
import { PaginatedResponse, PaginationParams } from '../types/common';

interface UsePaginatedDataOptions<T> {
  apiCall: (params?: PaginationParams) => AxiosPromise<any>;
  dataKey: string;
  params: PaginationParams;
}

export const usePaginatedData = <T>({
  apiCall,
  dataKey,
  params,
}: UsePaginatedDataOptions<T>) => {
  const serializeParams = (params: PaginationParams) => {
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        filtered[key] = value;
      }
    }
    return JSON.stringify(filtered);
  };

  const { data: response, error, isLoading } = useSWR(
    ['paginated', dataKey, serializeParams(params)],
    async () => {
      const res = await apiCall(params);
      return res.data;
    }
  );

  const paginatedData: PaginatedResponse<T> | null = response
    ? {
        data: response[dataKey] || [],
        pagination: response.pagination || null,
      }
    : null;

  return {
    data: paginatedData?.data || [],
    pagination: paginatedData?.pagination || null,
    loading: isLoading,
    error,
  };
};