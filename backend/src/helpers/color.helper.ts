import { TicketPriority } from '../common/constants/ticket-priority';
import { TicketStatus } from '../common/constants/ticket-status';

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  [TicketPriority.LOW]: '#10B981',
  [TicketPriority.MEDIUM]: '#3B82F6',
  [TicketPriority.HIGH]: '#F59E0B',
  [TicketPriority.URGENT]: '#EF4444',
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: '#3B82F6',
  [TicketStatus.IN_PROGRESS]: '#F59E0B',
  [TicketStatus.RESOLVED]: '#10B981',
  [TicketStatus.CLOSED]: '#64748B',
};

export const METRIC_COLORS = {
  RESOLVED: '#10B981',
  UNRESOLVED: '#3B82F6',
  OVERDUE: '#EF4444',
  CREATED: '#6366F1',
  NEUTRAL: '#94A3B8',
} as const;

export function getPriorityColor(priority: TicketPriority): string {
  return PRIORITY_COLORS[priority] || '#64748B';
}

export function getStatusColor(status: TicketStatus): string {
  return STATUS_COLORS[status] || '#64748B';
}
