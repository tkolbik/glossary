import apiClient from './apiClient';
import { ITerm } from '../models/models';
import { API_ENDPOINTS } from '../constants';
import { PaginationParams } from '../types/common';

export const termsApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get(API_ENDPOINTS.TERMS_ALL, { params }),

  get: (params?: PaginationParams) =>
    apiClient.get(API_ENDPOINTS.TERMS, { params }),

  getById: (id: number) => apiClient.get(`${API_ENDPOINTS.TERMS}/${id}`),

  create: (data: Partial<ITerm>) => apiClient.post(API_ENDPOINTS.TERMS, data),

  update: (
    termId: number,
    data: Partial<ITerm> & { markTranslationsForReview?: boolean }
  ) => {
    const { markTranslationsForReview, ...requestData } = data;
    return apiClient.put(
      API_ENDPOINTS.TERMS,
      { ...requestData, termId },
      {
        params: {
          markTranslationsForReview: markTranslationsForReview || false,
        },
      }
    );
  },

  delete: (id: number) => apiClient.delete(`${API_ENDPOINTS.TERMS}/${id}`),

  deleteAll: () => apiClient.delete(API_ENDPOINTS.TERMS_FULL),

  exportDocx: () =>
    apiClient.get(API_ENDPOINTS.EXPORT_TERMS_DOCX, { responseType: 'blob' }),

  getNavigation: (termName: string, languageCode?: string) =>
    apiClient.get<{ 
      previousTerm: { baseName: string; displayName: string } | null; 
      nextTerm: { baseName: string; displayName: string } | null;
    }>(
      `${API_ENDPOINTS.TERMS}/navigation/${encodeURIComponent(termName)}`,
      { params: languageCode ? { languageCode } : undefined }
    ),
};
