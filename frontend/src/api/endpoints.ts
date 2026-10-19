export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    ADMIN_ONLY: '/auth/admin-only',
    AGENT_ONLY: '/auth/agent-only',
    USERS: '/auth/users',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ANALYTICS: '/dashboard/analytics',
    SUMMARY: '/dashboard/summary',
  },
  TICKETS: {
    BASE: '/tickets',
    STATS: '/dashboard/stats',
    BY_ID: (id: string) => `/tickets/${id}`,
  },
  COMMENTS: {
    BY_TICKET: (ticketId: string) => `/tickets/${ticketId}/comments`,
    BY_ID: (ticketId: string, commentId: string) =>
      `/tickets/${ticketId}/comments/${commentId}`,
  },
} as const;
