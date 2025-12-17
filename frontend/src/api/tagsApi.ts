import apiClient from './apiClient';
import { ITag } from '../models/models';
import { API_ENDPOINTS } from '../constants';

export const tagsApi = {
  getAll: () => apiClient.get<ITag[]>(API_ENDPOINTS.TAGS),

  getByTermId: (termId: number) =>
    apiClient.get(`${API_ENDPOINTS.TAGS}/${termId}`),

  create: (data: Partial<ITag>) => apiClient.post(API_ENDPOINTS.TAGS, data),

  update: (tagId: number, data: Partial<ITag>) =>
    apiClient.put(API_ENDPOINTS.TAGS, { ...data, tagId }),

  delete: (id: number) => apiClient.delete(`${API_ENDPOINTS.TAGS}/${id}`),
};
