import apiClient from './apiClient';

export const fetcher = async (url: string, config?: { params?: Record<string, any> }) => {
  try {
    const res = await apiClient.get(url, config);
    return res.data;
  } catch (err: any) {
    console.error('Fetcher error:', {
      message: err.message,
      code: err.code,
      response: err.response,
      request: err.request,
      config: err.config,
    });
    throw err;
  }
};
