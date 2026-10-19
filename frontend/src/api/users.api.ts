import { apiClient } from './axios';
import { ENDPOINTS } from './endpoints';
import type { Role, User } from '../types/auth';

export const usersApi = {
  getUsers: async (role?: Role): Promise<User[]> => {
    const response = await apiClient.get<User[]>(ENDPOINTS.AUTH.USERS, {
      params: role ? { role } : undefined,
    });
    return response.data;
  },
};
