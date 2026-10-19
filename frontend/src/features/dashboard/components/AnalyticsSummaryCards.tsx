import React from 'react';
import {
  Inbox,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '../../../components/common';
import type { AnalyticsSummary } from '../../../types/dashboard';

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary | null;
  isLoading?: boolean;
  onNavigateStatus?: (status: string) => void;
  onNavigatePriority?: (priority: string) => void;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({
  summary,
  isLoading = false,
  onNavigateStatus,
  onNavigatePriority,
}) => {
  if (isLoading && !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse flex flex-col justify-between min-h-[148px] rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="h-9 w-9 rounded-xl bg-slate-100" />
            </div>
            <div className="my-2">
              <div className="h-8 w-16 rounded bg-slate-200" />
            </div>
            <div className="border-t border-slate-100 pt-3">
              <div className="h-3 w-24 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
      <StatCard
        title="Total Tickets"
        value={summary.total}
        icon={Inbox}
        variant="indigo"
        onClick={() => onNavigateStatus && onNavigateStatus('')}
        description={
          <div className="w-full flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="font-medium text-slate-600 truncate">
                {summary.totalUnresolved} Active in system
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-700 shrink-0" />
          </div>
        }
      />


      <StatCard
        title="Resolved Rate"
        value={`${summary.resolutionRate}%`}
        icon={CheckCircle2}
        variant="emerald"
        onClick={() => onNavigateStatus && onNavigateStatus('RESOLVED')}
        description={
          <div className="w-full flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-medium text-slate-600 truncate">
                {summary.totalResolved} of {summary.total} Solved
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-700 shrink-0" />
          </div>
        }
      />


      <StatCard
        title="Unresolved Queue"
        value={summary.totalUnresolved}
        icon={TrendingUp}
        variant="blue"
        onClick={() => onNavigateStatus && onNavigateStatus('IN_PROGRESS')}
        description={
          <div className="w-full flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              <span className="font-medium text-slate-600 truncate">
                {summary.open} Open · {summary.inProgress} Active
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-700 shrink-0" />
          </div>
        }
      />

      <StatCard
        title="Avg Resolution"
        value={summary.averageResolutionTimeFormatted || '< 4h'}
        icon={Clock}
        variant="amber"
        description={
          <div className="w-full flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="font-medium text-slate-600 truncate">
                Across {summary.totalResolved} resolved
              </span>
            </div>
          </div>
        }
      />

      <StatCard
        title="Overdue SLA"
        value={summary.overdueCount}
        icon={AlertTriangle}
        variant={summary.overdueCount > 0 ? 'rose' : 'slate'}
        onClick={
          summary.overdueCount > 0 && onNavigatePriority
            ? () => onNavigatePriority('URGENT')
            : undefined
        }
        description={
          <div className="w-full flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  summary.overdueCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <span
                className={`font-medium truncate ${
                  summary.overdueCount > 0 ? 'text-rose-600 font-semibold' : 'text-slate-600'
                }`}
              >
                {summary.overdueCount > 0 ? 'Action required' : 'All tickets on-track'}
              </span>
            </div>
            {summary.overdueCount > 0 && (
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-rose-600 shrink-0" />
            )}
          </div>
        }
      />
    </div>
  );
};

export default AnalyticsSummaryCards;
