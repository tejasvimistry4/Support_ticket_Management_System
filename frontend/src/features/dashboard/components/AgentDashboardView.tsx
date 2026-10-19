import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Clock,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Layers,
  ShieldCheck,
  Check,
  Flame,
  MessageSquare,
  Activity,
  ArrowUpDown,
} from 'lucide-react';
import { Button, Select, Badge, StatCard } from '../../../components/common';
import { ROUTES } from '../../../routes/RouteConstants';
import {
  formatDate,
  formatRelativeTime,
  getInitials,
} from '../../../utils';
import type { User } from '../../../types/auth';
import type {
  DashboardAnalyticsResponse,
  RecentActivityItem,
} from '../../../types/dashboard';
import type { Ticket, TicketPriority } from '../../../types/ticket';

export interface AgentDashboardViewProps {
  user: User | null;
  analytics: DashboardAnalyticsResponse | null;
  tickets: Ticket[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onNavigateWithFilters: (params: {
    status?: string;
    priority?: string;
  }) => void;
}

type SortOption = 'updated_desc' | 'priority_desc' | 'priority_asc' | 'created_desc';

const PRIORITY_RANK: Record<TicketPriority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export const AgentDashboardView: React.FC<AgentDashboardViewProps> = ({
  user,
  analytics,
  tickets,
  isLoading,
  isRefreshing,
  onRefresh,
  onNavigateWithFilters,
}) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('updated_desc');
  const [showAllActivity, setShowAllActivity] = useState(false);

  const summary = analytics?.summary;
  const slaMetrics = analytics?.slaMetrics;
  const recentActivities: RecentActivityItem[] = analytics?.recentActivity || [];

  const sortedTickets = useMemo(() => {
    const list = [...tickets];
    return list.sort((a, b) => {
      if (sortBy === 'priority_desc') {
        const diff = (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
        if (diff !== 0) return diff;
        return (
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        );
      }
      if (sortBy === 'priority_asc') {
        const diff = (PRIORITY_RANK[a.priority] || 0) - (PRIORITY_RANK[b.priority] || 0);
        if (diff !== 0) return diff;
        return (
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        );
      }
      if (sortBy === 'created_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
    });
  }, [tickets, sortBy]);

  const activeCount = tickets.filter(
    (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS',
  ).length;
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;

  const totalAssigned = summary?.total || 1;
  const urgentPriorityCount = summary?.urgent ?? 0;
  const highPriorityCount = summary?.high ?? 0;
  const mediumPriorityCount = summary?.medium ?? 0;
  const lowPriorityCount = summary?.low ?? 0;

  const urgentPct = Math.round((urgentPriorityCount / totalAssigned) * 100) || 0;
  const highPct = Math.round((highPriorityCount / totalAssigned) * 100) || 0;
  const mediumPct = Math.round((mediumPriorityCount / totalAssigned) * 100) || 0;
  const lowPct = Math.round((lowPriorityCount / totalAssigned) * 100) || 0;

  const activeWorkloadTotal = summary
    ? summary.open + summary.inProgress
    : activeCount;

  const getWorkloadCapacity = () => {
    if (activeWorkloadTotal <= 4) {
      return {
        label: 'Optimal Capacity',
        description: 'Available for new ticket assignments',
        variant: 'success' as const,
      };
    }
    if (activeWorkloadTotal <= 9) {
      return {
        label: 'Steady Workload',
        description: 'Healthy operational processing volume',
        variant: 'info' as const,
      };
    }
    return {
      label: 'High Workload',
      description: 'Prioritize resolution to meet SLA deadlines',
      variant: 'warning' as const,
    };
  };

  const workloadCapacity = getWorkloadCapacity();

  const complianceRate = slaMetrics?.complianceRate ?? 100;
  const slaCompliantCount = slaMetrics?.slaCompliantCount ?? 0;
  const slaBreachedCount = slaMetrics?.slaBreachedCount ?? 0;
  const totalResolved = summary?.totalResolved ?? summary?.resolved ?? 0;
  const resolutionRate = summary?.resolutionRate ?? 0;

  const displayedActivities = showAllActivity
    ? recentActivities
    : recentActivities.slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 text-left max-w-full">
  
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 sm:pb-5 border-b border-slate-200/80">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
              {getGreeting()},{' '}
              <span className="text-brand-700">{user?.name || 'Support Agent'}</span>
            </h1>
            <span className="hidden xs:inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20">
              Agent Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Dedicated workspace: My Assigned Tickets, My Workload, Resolution Statistics, and Recent Activity.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            className="flex-1 sm:flex-none justify-center h-9"
            leftIcon={
              <RefreshCw
                className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing || isLoading ? 'animate-spin text-brand-600' : ''
                  }`}
              />
            }
          >
            {isRefreshing || isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.TICKETS)}
            className="flex-1 sm:flex-none justify-center h-9"
            leftIcon={<Layers className="h-3.5 w-3.5" />}
            rightIcon={<ArrowRight className="h-3.5 w-3.5 ml-0.5" />}
          >
            Full Queue
          </Button>
        </div>
      </div>

      {isLoading && !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col justify-between min-h-[140px] sm:min-h-[148px] rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-100" />
              </div>
              <div className="my-2">
                <div className="h-7 sm:h-8 w-16 rounded bg-slate-200" />
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="h-3 w-28 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          <StatCard
            title="My Assigned Tickets"
            value={activeWorkloadTotal}
            icon={Inbox}
            variant="brand"
            onClick={() => onNavigateWithFilters({ status: 'OPEN' })}
            className="min-h-[140px] sm:min-h-[148px] h-full"
            description={
              <div className="w-full flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600 shrink-0" />
                  <span className="font-medium text-slate-600 truncate text-[11px] sm:text-xs">
                    {summary?.open ?? openCount} Open · {summary?.inProgress ?? inProgressCount} Active
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-700 shrink-0 ml-1.5" />
              </div>
            }
          />
          <StatCard
            title="Active Workload"
            value={summary?.inProgress ?? inProgressCount}
            icon={Clock}
            variant="amber"
            onClick={() => onNavigateWithFilters({ status: 'IN_PROGRESS' })}
            className="min-h-[140px] sm:min-h-[148px] h-full"
            description={
              <div className="w-full flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span className="font-medium text-slate-600 truncate text-[11px] sm:text-xs">
                    {workloadCapacity.label}
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-700 shrink-0 ml-1.5" />
              </div>
            }
          />

          <StatCard
            title="Urgent Attention"
            value={(summary?.urgent ?? 0) + (summary?.high ?? 0)}
            icon={Flame}
            variant="rose"
            onClick={() => onNavigateWithFilters({ priority: 'URGENT' })}
            className="min-h-[140px] sm:min-h-[148px] h-full"
            description={
              <div className="w-full flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${summary?.overdueCount && summary.overdueCount > 0
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-rose-500'
                      }`}
                  />
                  <span
                    className={`font-medium truncate text-[11px] sm:text-xs ${summary?.overdueCount && summary.overdueCount > 0
                        ? 'text-rose-600 font-semibold'
                        : 'text-slate-600'
                      }`}
                  >
                    {summary?.overdueCount && summary.overdueCount > 0
                      ? `${summary.overdueCount} Overdue SLA`
                      : `${summary?.urgent ?? 0} Urgent · ${summary?.high ?? 0} High`}
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-rose-600 shrink-0 ml-1.5" />
              </div>
            }
          />

          <StatCard
            title="Resolution Stats"
            value={totalResolved}
            icon={CheckCircle2}
            variant="emerald"
            onClick={() => onNavigateWithFilters({ status: 'RESOLVED' })}
            className="min-h-[140px] sm:min-h-[148px] h-full"
            description={
              <div className="w-full flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-medium text-emerald-700 truncate text-[11px] sm:text-xs">
                    {complianceRate}% SLA on-track
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-700 shrink-0 ml-1.5" />
              </div>
            }
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col h-[460px] sm:h-[480px] lg:h-[480px]">

          <div className="flex flex-col xs:flex-row xs:items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-3.5 gap-2.5 sm:gap-3 shrink-0 bg-white">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-500/20">
                <Inbox className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                    My Assigned Tickets
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 shrink-0">
                    {sortedTickets.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate hidden sm:block">
                  Operational queue requiring your attention
                </p>
              </div>
            </div>

      
            <div className="flex items-center justify-between xs:justify-end gap-1.5 shrink-0 w-full xs:w-auto pt-1 xs:pt-0 border-t xs:border-t-0 border-slate-50">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3 shrink-0" />
                Sort:
              </span>
              <Select
                variant="unstyled"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                <option value="updated_desc">Recently Updated</option>
                <option value="priority_desc">Priority (High to Low)</option>
                <option value="priority_asc">Priority (Low to High)</option>
                <option value="created_desc">Creation Date (Newest)</option>
              </Select>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3.5 sm:px-6 sm:py-3 animate-pulse flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 w-44 rounded bg-slate-200" />
                    <div className="h-2.5 w-28 rounded bg-slate-100" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-slate-100" />
                </div>
              ))
            ) : sortedTickets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-2.5 ring-1 ring-emerald-500/20">
                  <Check className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  No tickets assigned to you
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  You're all caught up! No tickets currently require your attention.
                </p>
              </div>
            ) : (
              sortedTickets.map((ticket) => {
                const isClosed = ticket.status === 'CLOSED';

                return (
                  <div
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-6 sm:py-3 transition-colors cursor-pointer ${isClosed
                        ? 'bg-slate-50/70 opacity-80 hover:bg-slate-100/60'
                        : 'hover:bg-slate-50/80 bg-white'
                      }`}
                  >
                    <div className="flex-1 min-w-0 pr-1 sm:pr-2">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">

                        <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400">
                          <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                          {formatRelativeTime(ticket.updatedAt || ticket.createdAt)}
                        </span>
                      </div>

                      <div className="mt-1">
                        <span
                          className={`font-semibold text-xs sm:text-sm line-clamp-2 sm:line-clamp-1 block transition-colors ${isClosed
                              ? 'text-slate-600 group-hover:text-slate-900'
                              : 'text-slate-900 group-hover:text-brand-700'
                            }`}
                          title={`Click to open ${ticket.title}`}
                        >
                          {ticket.title}
                        </span>
                      </div>

                      {ticket.createdBy && (
                        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                          Reported by {ticket.createdBy.name} · Created {formatDate(ticket.createdAt)}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50/60 transition-colors">
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

       
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 sm:px-6 sm:py-2.5 text-xs text-slate-500 min-h-[44px] shrink-0">
            <span className="truncate pr-2">
              Showing {sortedTickets.length} assigned ticket{sortedTickets.length === 1 ? '' : 's'}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.TICKETS)}
              className="p-0 h-auto font-semibold text-brand-600 hover:text-brand-800 hover:bg-transparent cursor-pointer shrink-0"
              rightIcon={<ArrowRight className="h-3 w-3" />}
            >
              View Queue
            </Button>
          </div>
        </div>

     
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col h-[460px] sm:h-[480px] lg:h-[480px]">

          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-3.5 min-h-[60px] sm:min-h-[64px] shrink-0 bg-white">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-500/20">
                <Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                  My Workload
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 truncate hidden xs:block sm:block">
                  Queue pressure & capacity
                </p>
              </div>
            </div>

            <Badge
              variant={workloadCapacity.variant}
              size="sm"
              className="shrink-0 text-[10px] font-bold"
            >
              {workloadCapacity.label}
            </Badge>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 flex flex-col justify-between gap-3">
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-xs">
              <div
                onClick={() => onNavigateWithFilters({ status: 'IN_PROGRESS' })}
                className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-2 sm:p-2.5 hover:border-amber-300 hover:bg-amber-50/30 transition text-left"
              >
                <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-semibold truncate">
                  In Progress
                </span>
                <span className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 block tabular-nums">
                  {summary?.inProgress ?? inProgressCount}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                  Active work
                </span>
              </div>

              <div
                onClick={() => onNavigateWithFilters({ status: 'OPEN' })}
                className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-2 sm:p-2.5 hover:border-brand-300 hover:bg-brand-50/30 transition text-left"
              >
                <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-semibold truncate">
                  Open Queue
                </span>
                <span className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 block tabular-nums">
                  {summary?.open ?? openCount}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                  To triage
                </span>
              </div>

              <div
                onClick={() => onNavigateWithFilters({ priority: 'URGENT' })}
                className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-2 sm:p-2.5 hover:border-rose-300 hover:bg-rose-50/30 transition text-left"
              >
                <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-semibold truncate">
                  Urgent / High
                </span>
                <span className="text-base sm:text-xl font-bold text-rose-600 mt-0.5 block tabular-nums">
                  {(summary?.urgent ?? 0) + (summary?.high ?? 0)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                  High focus
                </span>
              </div>
            </div>

            <div className="flex flex-col xs:flex-row xs:items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 sm:px-3.5 py-2 text-xs gap-1 xs:gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                <span className="font-semibold text-slate-700 truncate">{workloadCapacity.label}</span>
              </div>
              <span className="text-[11px] text-slate-500 truncate xs:text-right">{workloadCapacity.description}</span>
            </div>

            <div className="space-y-1.5 sm:space-y-2 pt-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Priority Distribution
                </span>
                <span className="text-slate-400 text-[11px]">
                  {totalAssigned} total assigned
                </span>
              </div>

              <div
                onClick={() => onNavigateWithFilters({ priority: 'URGENT' })}
                className="group cursor-pointer p-1 -mx-1 rounded-lg hover:bg-slate-50 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 group-hover:text-rose-600 transition-colors">
                    Urgent
                  </span>
                  <span className="text-slate-500 tabular-nums font-mono text-[11px]">
                    {urgentPriorityCount} ({urgentPct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${urgentPct}%` }}
                  />
                </div>
              </div>

              <div
                onClick={() => onNavigateWithFilters({ priority: 'HIGH' })}
                className="group cursor-pointer p-1 -mx-1 rounded-lg hover:bg-slate-50 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 group-hover:text-amber-600 transition-colors">
                    High
                  </span>
                  <span className="text-slate-500 tabular-nums font-mono text-[11px]">
                    {highPriorityCount} ({highPct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${highPct}%` }}
                  />
                </div>
              </div>

              <div
                onClick={() => onNavigateWithFilters({ priority: 'MEDIUM' })}
                className="group cursor-pointer p-1 -mx-1 rounded-lg hover:bg-slate-50 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                    Medium
                  </span>
                  <span className="text-slate-500 tabular-nums font-mono text-[11px]">
                    {mediumPriorityCount} ({mediumPct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${mediumPct}%` }}
                  />
                </div>
              </div>

              <div
                onClick={() => onNavigateWithFilters({ priority: 'LOW' })}
                className="group cursor-pointer p-1 -mx-1 rounded-lg hover:bg-slate-50 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    Low
                  </span>
                  <span className="text-slate-500 tabular-nums font-mono text-[11px]">
                    {lowPriorityCount} ({lowPct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-400 transition-all duration-300"
                    style={{ width: `${lowPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 sm:px-6 sm:py-2.5 text-xs text-slate-500 min-h-[44px] shrink-0">
            <span className="truncate pr-2">
              {activeWorkloadTotal} active in queue · {totalAssigned} total
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigateWithFilters({ status: 'IN_PROGRESS' })}
              className="p-0 h-auto font-semibold text-amber-700 hover:text-amber-800 hover:bg-transparent cursor-pointer shrink-0"
              rightIcon={<ArrowRight className="h-3 w-3" />}
            >
              View Active
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col h-[460px] sm:h-[480px] lg:h-[480px]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-3.5 min-h-[60px] sm:min-h-[64px] shrink-0 bg-white">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-500/20">
                <Activity className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                    Recent Activity
                  </h2>
                  <Badge variant="info" size="sm" className="gap-1 text-[10px] font-semibold shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Live Feed
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate hidden sm:block">
                  Latest events on your assigned tickets
                </p>
              </div>
            </div>

            {recentActivities.length > 5 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="p-0 h-auto text-xs font-semibold text-brand-600 hover:text-brand-800 hover:bg-transparent cursor-pointer shrink-0 ml-2"
              >
                {showAllActivity ? 'Show Less' : `View All (${recentActivities.length})`}
              </Button>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="p-3.5 sm:px-5 animate-pulse flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-40 rounded bg-slate-200" />
                    <div className="h-2.5 w-60 rounded bg-slate-100" />
                  </div>
                </div>
              ))
            ) : recentActivities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 mb-2.5">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  No recent activity yet
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Discussions and status updates on your tickets will appear here automatically.
                </p>
              </div>
            ) : (
              displayedActivities.map((act) => {
                const isCurrentUser =
                  user?.email &&
                  act.actorEmail &&
                  user.email.toLowerCase() === act.actorEmail.toLowerCase();

                return (
                  <div
                    key={act.id}
                    onClick={() => navigate(`/tickets/${act.ticketId}`)}
                    className="group p-3 sm:px-5 sm:py-2.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start gap-2.5 sm:gap-3"
                  >
                    <div className="mt-0.5 shrink-0">
                      {act.type === 'STATUS_CHANGE' ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      ) : act.type === 'ASSIGNED' ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-500/20">
                          <Inbox className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-500/20 font-bold text-[10px]">
                          {getInitials(act.actorName)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex flex-col xs:flex-row xs:items-baseline justify-between gap-0.5 xs:gap-2">
                        <p className="text-xs text-slate-800 line-clamp-2 xs:line-clamp-1 leading-snug">
                          {act.type === 'STATUS_CHANGE' ? (
                            <>
                              <span className="font-bold text-slate-900">
                                You updated status
                              </span>{' '}
                              <span className="text-slate-400">on</span>{' '}
                              <span className="font-semibold text-brand-700 group-hover:underline">
                                {act.ticketTitle}
                              </span>
                            </>
                          ) : act.type === 'ASSIGNED' ? (
                            <>
                              <span className="font-bold text-slate-900">
                                Assigned to you
                              </span>
                              <span className="text-slate-400">: </span>
                              <span className="font-semibold text-brand-700 group-hover:underline">
                                {act.ticketTitle}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-slate-900">
                                {isCurrentUser ? 'You' : act.actorName}
                              </span>{' '}
                              <span className="text-slate-400">commented on</span>{' '}
                              <span className="font-semibold text-brand-700 group-hover:underline">
                                {act.ticketTitle}
                              </span>
                            </>
                          )}
                        </p>

                        <span className="text-[10px] sm:text-[11px] text-slate-400 whitespace-nowrap shrink-0 self-start xs:self-auto">
                          {formatRelativeTime(act.createdAt)}
                        </span>
                      </div>

                      {act.type === 'COMMENT' && act.message && (
                        <p className="text-xs text-slate-600 line-clamp-2 xs:line-clamp-1 bg-slate-50/80 rounded-md p-1.5 border border-slate-100 mt-1">
                          {act.message}
                        </p>
                      )}
                    </div>

                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 sm:px-6 sm:py-2.5 text-xs text-slate-500 min-h-[44px] shrink-0">
            <span className="truncate pr-2">
              Showing {displayedActivities.length} of {recentActivities.length} events
            </span>
            {recentActivities.length > 5 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="p-0 h-auto font-semibold text-brand-600 hover:text-brand-800 hover:bg-transparent cursor-pointer shrink-0"
                rightIcon={<ArrowRight className="h-3 w-3" />}
              >
                {showAllActivity ? 'Show Less' : 'View All'}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.TICKETS)}
                className="p-0 h-auto font-semibold text-brand-600 hover:text-brand-800 hover:bg-transparent cursor-pointer shrink-0"
                rightIcon={<ArrowRight className="h-3 w-3" />}
              >
                View Tickets
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col h-[460px] sm:h-[480px] lg:h-[480px]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-3.5 min-h-[60px] sm:min-h-[64px] shrink-0 bg-white">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                  Resolution Statistics
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 truncate hidden xs:block sm:block">
                  SLA timeliness & personal output
                </p>
              </div>
            </div>

            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${complianceRate >= 90
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                  : complianceRate >= 75
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                    : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                }`}
            >
              {complianceRate >= 90
                ? 'On Track'
                : complianceRate >= 75
                  ? 'Acceptable'
                  : 'Action Needed'}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3.5 sm:p-5 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {complianceRate}%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {complianceRate >= 90 ? 'Target Exceeded (≥90%)' : 'Target: 95% SLA'}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${complianceRate >= 90
                      ? 'bg-emerald-500'
                      : complianceRate >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  style={{ width: `${Math.min(100, complianceRate)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2 sm:p-2.5">
                <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-semibold truncate">
                  Total Solved
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block tabular-nums">
                  {totalResolved} tickets
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2 sm:p-2.5">
                <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-semibold truncate">
                  Resolution Rate
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5 block tabular-nums">
                  {resolutionRate}%
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2 sm:p-2.5">
                <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-semibold truncate">
                  Within SLA
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-800 mt-0.5 block tabular-nums">
                  {slaCompliantCount}
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2 sm:p-2.5">
                <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-semibold truncate">
                  Breached SLA
                </span>
                <span
                  className={`text-sm sm:text-base font-bold mt-0.5 block tabular-nums ${slaBreachedCount > 0 ? 'text-rose-600' : 'text-slate-800'
                    }`}
                >
                  {slaBreachedCount}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 sm:px-3.5 py-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-medium truncate">Avg. Resolution Time</span>
              </div>
              <strong className="font-semibold text-slate-800 shrink-0 ml-2">
                {summary?.averageResolutionTimeFormatted || 'N/A'}
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 sm:px-6 sm:py-2.5 text-xs text-slate-500 min-h-[44px] shrink-0">
            <div className="flex items-center gap-1.5 text-slate-500 min-w-0 pr-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{complianceRate >= 90 ? 'SLA Target Achieved' : 'Target: 95% SLA'}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onNavigateWithFilters({ status: 'RESOLVED' })}
              className="p-0 h-auto font-semibold text-emerald-600 hover:text-emerald-800 hover:bg-transparent cursor-pointer shrink-0"
              rightIcon={<ArrowRight className="h-3 w-3" />}
            >
              View Resolved
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

