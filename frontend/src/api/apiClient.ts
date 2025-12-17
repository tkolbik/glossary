import axios, { AxiosInstance, AxiosError } from 'axios';
import { ROUTES } from '../constants';

const apiClient: AxiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:61068/api/'}`,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === ROUTES.LOGIN;
      const isAdminPage = window.location.pathname.startsWith(ROUTES.ADMIN);
      const isVerifyEndpoint = error.config?.url?.includes('/auth/verify');

      if (isAdminPage && !isLoginPage && !isVerifyEndpoint) {
        window.location.href = ROUTES.LOGIN;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
