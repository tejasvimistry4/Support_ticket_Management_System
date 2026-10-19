import { TicketPriority } from '../../../common/constants/ticket-priority';
import { TicketStatus } from '../../../common/constants/ticket-status';

export class DashboardSummaryDto {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  totalResolved: number;
  totalUnresolved: number;
  resolutionRate: number;
  averageResolutionTimeHours: number;
  averageResolutionTimeFormatted: string;
  overdueCount: number;
  low: number;
  medium: number;
  high: number;
  urgent: number;
  unassigned: number;
}

export class TicketsOverTimeDto {
  date: string;
  label: string;
  created: number;
  resolved: number;
}

export class PriorityDistributionDto {
  priority: TicketPriority;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export class StatusDistributionDto {
  status: TicketStatus;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export class ResolvedVsUnresolvedDto {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export class AgentWorkloadDto {
  agentId: string;
  agentName: string;
  agentEmail: string;
  totalAssigned: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  overdueCount: number;
  avgResolutionHours: number;
}

export class SlaMetricDto {
  slaCompliantCount: number;
  slaBreachedCount: number;
  complianceRate: number;
}

export class RecentActivityDto {
  id: string;
  type: 'COMMENT' | 'STATUS_CHANGE' | 'ASSIGNED';
  ticketId: string;
  ticketTitle: string;
  ticketStatus: TicketStatus;
  ticketPriority: TicketPriority;
  actorName: string;
  actorEmail?: string;
  message: string;
  createdAt: string;
}

export class DashboardAnalyticsDto {
  summary: DashboardSummaryDto;
  ticketsOverTime: TicketsOverTimeDto[];
  priorityDistribution: PriorityDistributionDto[];
  statusDistribution: StatusDistributionDto[];
  resolvedVsUnresolved: ResolvedVsUnresolvedDto[];
  agentWorkload: AgentWorkloadDto[];
  slaMetrics: SlaMetricDto;
  recentActivity?: RecentActivityDto[];
  dateRange: {
    startDate: string;
    endDate: string;
    timeRange: string;
    groupBy: string;
  };
}
