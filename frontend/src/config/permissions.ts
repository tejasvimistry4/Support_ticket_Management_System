import type { Role } from '../types/auth';

export const PERMISSIONS = {
  ADMIN: [
    'tickets:create',
    'tickets:read',
    'tickets:update_all',
    'tickets:delete',
    'tickets:assign',
    'users:read',
    'reports:view',
  ],
  SUPPORT_AGENT: [
    'tickets:read_assigned',
    'tickets:update_status',
  ],
} as const;

export const hasPermission = (role: Role | null | undefined, permission: string): boolean => {
  if (!role) return false;
  const rolePermissions: readonly string[] = PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
};
