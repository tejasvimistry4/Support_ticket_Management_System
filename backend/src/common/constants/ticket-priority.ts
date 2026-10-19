export { TicketPriority } from '@prisma/client';

export const TICKET_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
] as const;

export type TicketPriorityType = (typeof TICKET_PRIORITIES)[number];
