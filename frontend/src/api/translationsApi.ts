import apiClient from './apiClient';
import { ITranslation } from '../models/models';
import { API_ENDPOINTS } from '../constants';

export interface TranslationPaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  letter?: string;
  languageCode?: string;
  status?: string;
}

export const translationsApi = {
  getAll: (params?: TranslationPaginationParams) =>
    apiClient.get(API_ENDPOINTS.TRANSLATIONS, { params }),

  getUntranslated: (
    languageCode: string,
    params?: { page?: number; pageSize?: number; search?: string }
  ) =>
    apiClient.get(
      `${API_ENDPOINTS.TRANSLATIONS_UNTRANSLATED_BASE}/${languageCode}`,
      { params }
    ),

  create: (data: Partial<ITranslation>) =>
    apiClient.post(API_ENDPOINTS.TRANSLATIONS, data),

  update: (
    data: Partial<ITranslation> & { termId: number; languageCode: string }
  ) => apiClient.put(API_ENDPOINTS.TRANSLATIONS, data),

  markAsReviewed: (termId: number, languageCode: string) =>
    apiClient.put('translations/reviewed', { termId, languageCode }),

  delete: (termId: number, languageCode: string) =>
    apiClient.delete(`${API_ENDPOINTS.TRANSLATIONS}/${termId}/${languageCode}`),

  deleteByLanguage: (languageCode: string) =>
    apiClient.delete(
      `${API_ENDPOINTS.TRANSLATIONS}/${languageCode}`
    ),
};



