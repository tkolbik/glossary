import apiClient from './apiClient';
import { ILanguage } from '../models/models';
import { API_ENDPOINTS } from '../constants';

export const languagesApi = {
  getAll: () => apiClient.get<ILanguage[]>(API_ENDPOINTS.LANGUAGES),

  create: (data: Partial<ILanguage>) =>
    apiClient.post(API_ENDPOINTS.LANGUAGES, data),

  delete: (id: number) => apiClient.delete(`${API_ENDPOINTS.LANGUAGES}/${id}`),
};
