import { dashboardApi } from '../api/dashboard.api';
import type {
  AnalyticsQueryParams,
  DashboardAnalyticsResponse,
  DashboardStats,
} from '../types/dashboard';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    return dashboardApi.getStats();
  },

  getAnalytics: async (
    params?: AnalyticsQueryParams,
  ): Promise<DashboardAnalyticsResponse> => {
    return dashboardApi.getAnalytics(params);
  },

  getSummary: async (
    params?: AnalyticsQueryParams,
  ): Promise<DashboardAnalyticsResponse> => {
    return dashboardApi.getSummary(params);
  },
};
