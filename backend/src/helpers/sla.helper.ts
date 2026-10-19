import { TicketPriority } from '../common/constants/ticket-priority';
import { TicketStatus } from '../common/constants/ticket-status';

export const SLA_HOURS_MAP: Record<TicketPriority, number> = {
  [TicketPriority.URGENT]: 24,
  [TicketPriority.HIGH]: 48,
  [TicketPriority.MEDIUM]: 72,
  [TicketPriority.LOW]: 120,
};

export function getSlaHours(priority: TicketPriority): number {
  return SLA_HOURS_MAP[priority] ?? 72;
}

export function isTicketOverdue(
  ticket: {
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: Date;
    dueDate?: Date | null;
  },
  now: Date = new Date(),
): boolean {
  if (
    ticket.status === TicketStatus.RESOLVED ||
    ticket.status === TicketStatus.CLOSED
  ) {
    return false;
  }

  if (ticket.dueDate) {
    return now.getTime() > new Date(ticket.dueDate).getTime();
  }

  const slaHours = getSlaHours(ticket.priority);
  const deadline = new Date(
    new Date(ticket.createdAt).getTime() + slaHours * 60 * 60 * 1000,
  );

  return now.getTime() > deadline.getTime();
}

export function calculateResolutionDuration(
  createdAt: Date,
  resolvedAt?: Date | null,
  updatedAt?: Date | null,
): number {
  const effectiveResolvedDate = resolvedAt || updatedAt;
  if (!effectiveResolvedDate) return 0;

  const duration =
    new Date(effectiveResolvedDate).getTime() - new Date(createdAt).getTime();
  return Math.max(0, duration);
}
