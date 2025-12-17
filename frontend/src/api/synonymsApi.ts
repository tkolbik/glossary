import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';

export interface CreateSynonymRequest {
  termId: number;
  synonymTermId: number;
}

export const synonymsApi = {
  getByTermId: (termId: number) =>
    apiClient.get(`${API_ENDPOINTS.SYNONYMS}/term/${termId}`),

  getById: (id: number) =>
    apiClient.get(`${API_ENDPOINTS.SYNONYMS}/${id}`),

  create: (data: CreateSynonymRequest) =>
    apiClient.post(API_ENDPOINTS.SYNONYMS, data),

  delete: (id: number) =>
    apiClient.delete(`${API_ENDPOINTS.SYNONYMS}/${id}`),
};
