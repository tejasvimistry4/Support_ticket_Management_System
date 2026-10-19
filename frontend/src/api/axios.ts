import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { setupInterceptors } from './interceptor';

const rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

setupInterceptors(apiClient);

export default apiClient;
