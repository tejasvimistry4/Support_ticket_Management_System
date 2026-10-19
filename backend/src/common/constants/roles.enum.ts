export { Role } from '@prisma/client';

export const ROLES = ['ADMIN', 'SUPPORT_AGENT'] as const;

export type RoleType = (typeof ROLES)[number];
