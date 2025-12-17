import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';

export interface ImportMapping {
  [key: string]: string;
}

export const importApi = {
  importTerms: (formData: FormData) =>
    apiClient.post(API_ENDPOINTS.IMPORT_TERMS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  importTranslations: (formData: FormData) =>
    apiClient.post(API_ENDPOINTS.IMPORT_TRANSLATIONS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};
