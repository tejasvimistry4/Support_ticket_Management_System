import { TicketPriority, TicketStatus } from './ticket';

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  low: number;
  medium: number;
  high: number;
  urgent: number;
  unassigned: number;
}

export interface AnalyticsSummary {
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

export interface TicketsOverTimePoint {
  date: string;
  label: string;
  created: number;
  resolved: number;
}

export interface PriorityDistributionPoint {
  priority: TicketPriority;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StatusDistributionPoint {
  status: TicketStatus;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ResolvedVsUnresolvedPoint {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AgentWorkloadPoint {
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

export interface SlaMetricSummary {
  slaCompliantCount: number;
  slaBreachedCount: number;
  complianceRate: number;
}

export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
  timeRange: '7d' | '30d' | '90d' | 'all';
  groupBy: 'day' | 'week';
}

export interface RecentActivityItem {
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

export interface DashboardAnalyticsResponse {
  summary: AnalyticsSummary;
  ticketsOverTime: TicketsOverTimePoint[];
  priorityDistribution: PriorityDistributionPoint[];
  statusDistribution: StatusDistributionPoint[];
  resolvedVsUnresolved: ResolvedVsUnresolvedPoint[];
  agentWorkload: AgentWorkloadPoint[];
  slaMetrics: SlaMetricSummary;
  recentActivity?: RecentActivityItem[];
  dateRange: AnalyticsDateRange;
}

export interface AnalyticsQueryParams {
  timeRange?: '7d' | '30d' | '90d' | 'all';
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week';
  agentId?: string;
}
