import apiClient from './apiClient';
import { ISuggestion } from '../models/models';
import { API_ENDPOINTS } from '../constants';

export interface SuggestionApprovePayload {
  suggestionId: number;
  termId?: number | null;
  suggestedName?: string;
  languageCode: string;
  fullname: string;
  reasoning: string;
  reference: string;
  description: string;
  email: string;
  baseTermName?: string;
  baseDescription?: string;
  baseReference?: string;
}

export const suggestionsApi = {
  getAll: () => apiClient.get<ISuggestion[]>(API_ENDPOINTS.SUGGESTIONS),

  create: (data: Partial<ISuggestion> & { captchaToken: string }) =>
    apiClient.post(API_ENDPOINTS.SUGGESTIONS, data),

  approve: (payload: SuggestionApprovePayload) =>
    apiClient.post(`${API_ENDPOINTS.SUGGESTIONS}/approve`, payload),

  delete: (id: number) =>
    apiClient.delete(`${API_ENDPOINTS.SUGGESTIONS}/${id}`),

  getRateLimitStatus: () =>
    apiClient.get(`${API_ENDPOINTS.SUGGESTIONS}/rate-limit-status`),
};
