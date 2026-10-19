import React from 'react';
import {
  Layers,
  Inbox,
  Clock,
  CheckCircle2,
  Archive,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { StatCard, Button } from '../../../components/common';
import type { TicketStats } from '../../../types/ticket';
import { ROUTES } from '../../../routes/RouteConstants';

export interface DashboardStatsProps {
  stats: TicketStats | null;
  isLoading?: boolean;
  onNavigate: (route: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  isLoading = false,
  onNavigate,
}) => {
  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-5 min-h-[136px] flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="h-9 w-9 rounded-xl bg-slate-100" />
            </div>
            <div className="my-2">
              <div className="h-7 w-16 rounded bg-slate-200" />
            </div>
            <div className="h-3 w-28 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Tickets"
          value={stats.total}
          description="All tickets in queue"
          icon={Layers}
          variant="brand"
          isPrimary={true}
          onClick={() => onNavigate(ROUTES.TICKETS)}
        />

        <StatCard
          title="Open"
          value={stats.open}
          description="Awaiting action"
          icon={Inbox}
          variant="emerald"
          onClick={() => onNavigate(`${ROUTES.TICKETS}?status=OPEN`)}
        />

        <StatCard
          title="In Progress"
          value={stats.inProgress}
          description="Under investigation"
          icon={Clock}
          variant="amber"
          onClick={() => onNavigate(`${ROUTES.TICKETS}?status=IN_PROGRESS`)}
        />

        <StatCard
          title="Resolved"
          value={stats.resolved}
          description="Completed tickets"
          icon={CheckCircle2}
          variant="teal"
          onClick={() => onNavigate(`${ROUTES.TICKETS}?status=RESOLVED`)}
        />

        <StatCard
          title="Closed"
          value={stats.closed}
          description="Archived tickets"
          icon={Archive}
          variant="slate"
          onClick={() => onNavigate(`${ROUTES.TICKETS}?status=CLOSED`)}
        />
      </div>

      {stats.urgent > 0 && (
        <Button
          type="button"
          variant="unstyled"
          onClick={() => onNavigate(`${ROUTES.TICKETS}?priority=URGENT`)}
          className="group w-full flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-2.5 text-xs font-semibold text-rose-800 transition hover:bg-rose-100/80 cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
            </span>
            <Flame className="h-4 w-4 text-rose-600" />
            <span>
              {stats.urgent} Urgent Ticket{stats.urgent > 1 ? 's' : ''} require immediate attention
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-rose-700 font-bold group-hover:underline">
            <span>View urgent queue</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Button>
      )}
    </div>
  );
};

export default DashboardStats;
