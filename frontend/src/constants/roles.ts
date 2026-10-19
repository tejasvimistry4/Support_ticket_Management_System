import type { Role } from '../types/auth';

export const ROLES = {
  ADMIN: 'ADMIN',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
} as const;

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrator',
  SUPPORT_AGENT: 'Support Agent',
};

export const ROLE_BADGE_VARIANTS: Record<Role, 'purple' | 'emerald'> = {
  ADMIN: 'purple',
  SUPPORT_AGENT: 'emerald',
};
