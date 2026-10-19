export { TicketStatus } from '@prisma/client';

export const TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const;

export type TicketStatusType = (typeof TICKET_STATUSES)[number];
