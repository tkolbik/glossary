import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';

export interface NotificationSettingsDto {
  email: string | null;
  senderEmail: string | null;
  mailjetApiKey: string | null;
  mailjetApiSecret: string | null;
}

export const settingsApi = {
  getSettings: () =>
    apiClient.get<NotificationSettingsDto>(API_ENDPOINTS.SETTINGS),

  updateSettings: (payload: NotificationSettingsDto) =>
    apiClient.put(API_ENDPOINTS.SETTINGS, payload),
};

