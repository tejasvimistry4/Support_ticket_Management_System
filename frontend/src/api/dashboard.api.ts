import { apiClient } from './axios';
import { ENDPOINTS } from './endpoints';
import type {
  AnalyticsQueryParams,
  DashboardAnalyticsResponse,
  DashboardStats,
} from '../types/dashboard';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>(ENDPOINTS.DASHBOARD.STATS);
    return response.data;
  },

  getAnalytics: async (
    params?: AnalyticsQueryParams,
  ): Promise<DashboardAnalyticsResponse> => {
    const response = await apiClient.get<DashboardAnalyticsResponse>(
      ENDPOINTS.DASHBOARD.ANALYTICS,
      { params },
    );
    return response.data;
  },

  getSummary: async (
    params?: AnalyticsQueryParams,
  ): Promise<DashboardAnalyticsResponse> => {
    const response = await apiClient.get<DashboardAnalyticsResponse>(
      ENDPOINTS.DASHBOARD.SUMMARY,
      { params },
    );
    return response.data;
  },
};
