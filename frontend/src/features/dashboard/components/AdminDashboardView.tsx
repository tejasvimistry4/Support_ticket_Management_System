import React from 'react';
import { Plus, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import {
  Button,
  RecentTicketsTable,
  TeamDirectoryTable,
  Alert,
  Badge,
} from '../../../components/common';
import {
  AnalyticsSummaryCards,
  TicketsTrendChart,
  PriorityDistributionChart,
  ResolvedVsUnresolvedChart,
  AgentWorkloadChart,
} from './';
import { CreateTicketModal } from '../../tickets';
import type { User } from '../../../types/auth';
import type { DashboardAnalyticsResponse } from '../../../types/dashboard';
import type { Ticket } from '../../../types/ticket';

export interface AdminDashboardViewProps {
  user: User | null;
  analytics: DashboardAnalyticsResponse | null;
  recentTickets: Ticket[];
  userList: User[];
  isLoadingAnalytics: boolean;
  isLoadingUsers: boolean;
  isRefreshing: boolean;
  analyticsError: string | null;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  onRefresh: () => void;
  onTicketCreated: () => void;
  onNavigateWithFilters: (params: {
    status?: string;
    priority?: string;
    assignedToId?: string;
  }) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  user,
  analytics,
  recentTickets,
  userList,
  isLoadingAnalytics,
  isLoadingUsers,
  isRefreshing,
  analyticsError,
  isCreateModalOpen,
  setIsCreateModalOpen,
  onRefresh,
  onTicketCreated,
  onNavigateWithFilters,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-left">
  
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {getGreeting()},{' '}
              <span className="text-brand-700">{user?.name || 'Administrator'}</span>
            </h1>
            <Badge variant="primary" size="md">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
              Executive Admin
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Company-wide support volume, team workload, and resolution performance analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing || isLoadingAnalytics}
            leftIcon={
              <RefreshCw
                className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing || isLoadingAnalytics ? 'animate-spin text-brand-600' : ''
                  }`}
              />
            }
          >
            {isRefreshing || isLoadingAnalytics ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            New Ticket
          </Button>
        </div>
      </div>

     
      {analyticsError && (
        <Alert
          variant="error"
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="p-0 h-auto font-bold underline text-rose-700 hover:text-rose-900 hover:bg-transparent cursor-pointer"
            >
              Retry
            </Button>
          }
        >
          {analyticsError}
        </Alert>
      )}

  
      <AnalyticsSummaryCards
        summary={analytics?.summary || null}
        isLoading={isLoadingAnalytics}
        onNavigateStatus={(status) => onNavigateWithFilters({ status })}
        onNavigatePriority={(priority) => onNavigateWithFilters({ priority })}
      />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TicketsTrendChart
            data={analytics?.ticketsOverTime || []}
            isLoading={isLoadingAnalytics}
          />
        </div>
        <div>
          <PriorityDistributionChart
            data={analytics?.priorityDistribution || []}
            isLoading={isLoadingAnalytics}
            onSelectPriority={(priority) => onNavigateWithFilters({ priority })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ResolvedVsUnresolvedChart
          data={analytics?.resolvedVsUnresolved || []}
          slaMetrics={
            analytics?.slaMetrics || {
              slaCompliantCount: 0,
              slaBreachedCount: 0,
              complianceRate: 100,
            }
          }
          isLoading={isLoadingAnalytics}
          onSelectStatus={(status) => onNavigateWithFilters({ status })}
        />

        <AgentWorkloadChart
          data={analytics?.agentWorkload || []}
          isLoading={isLoadingAnalytics}
          onSelectAgent={(agentId) =>
            onNavigateWithFilters({
              assignedToId: agentId === 'unassigned' ? undefined : agentId,
            })
          }
        />
      </div>

      <RecentTicketsTable
        tickets={recentTickets}
        isLoading={isLoadingAnalytics}
        isAdmin={true}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <TeamDirectoryTable users={userList} isLoading={isLoadingUsers} />

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={onTicketCreated}
      />
    </div>
  );
};
