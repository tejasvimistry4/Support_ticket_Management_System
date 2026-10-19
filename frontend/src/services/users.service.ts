import { apiClient } from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import type { Role, User } from '../types/auth';

export const usersService = {
  getUsers: async (role?: Role): Promise<User[]> => {
    const response = await apiClient.get<User[]>(ENDPOINTS.AUTH.USERS, {
      params: role ? { role } : undefined,
    });
    return response.data;
  },
};

export const usersApi = usersService;
export default usersService;
