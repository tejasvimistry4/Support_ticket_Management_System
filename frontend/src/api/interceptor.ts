import { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { clearStoredAuth, getStoredToken } from '../utils/localStorage';

export const setupInterceptors = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getStoredToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        const requestUrl = error.config?.url || '';
        const isAuthAttempt =
          requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

        if (!isAuthAttempt) {
          clearStoredAuth();
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }
      return Promise.reject(error);
    },
  );
};
