import { apiClient } from './axios';
import { ENDPOINTS } from './endpoints';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      payload,
    );
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  getAdminData: async (): Promise<{
    message: string;
    authorizedUser: Partial<User>;
    systemPrivileges: string[];
    timestamp: string;
  }> => {
    const response = await apiClient.get(ENDPOINTS.AUTH.ADMIN_ONLY);
    return response.data;
  },

  getAgentData: async (): Promise<{
    message: string;
    authorizedUser: Partial<User>;
    agentPrivileges: string[];
    timestamp: string;
  }> => {
    const response = await apiClient.get(ENDPOINTS.AUTH.AGENT_ONLY);
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>(ENDPOINTS.AUTH.USERS);
    return response.data;
  },
};
