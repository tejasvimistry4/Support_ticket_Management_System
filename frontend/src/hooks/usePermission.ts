import { useAuth } from './useAuth';
import type { Role } from '../types/auth';

export const usePermission = () => {
  const { role, isAuthenticated, isAdmin } = useAuth();

  const hasRole = (requiredRoles: Role | Role[]): boolean => {
    if (!isAuthenticated || !role) return false;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return rolesArray.includes(role);
  };

  const canAccessAdmin = (): boolean => {
    return hasRole('ADMIN');
  };

  const canAccessAgent = (): boolean => {
    return hasRole(['ADMIN', 'SUPPORT_AGENT']);
  };

  return {
    role,
    isAdmin,
    hasRole,
    canAccessAdmin,
    canAccessAgent,
  };
};

export default usePermission;
