import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import type {
  ResolvedVsUnresolvedPoint,
  SlaMetricSummary,
} from '../../../types/dashboard';

interface ResolvedVsUnresolvedChartProps {
  data: ResolvedVsUnresolvedPoint[];
  slaMetrics: SlaMetricSummary;
  isLoading?: boolean;
  onSelectStatus?: (status: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ResolvedVsUnresolvedPoint;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm p-2.5 shadow-lg text-xs space-y-1">
      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: point.color }}
        />
        <span>{point.name}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-slate-500">
        <span>Tickets:</span>
        <span className="font-bold text-slate-900">{point.count}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-slate-500">
        <span>Rate:</span>
        <span className="font-bold text-slate-900">{point.percentage}%</span>
      </div>
    </div>
  );
};

export const ResolvedVsUnresolvedChart: React.FC<ResolvedVsUnresolvedChartProps> = ({
  data,
  slaMetrics,
  isLoading = false,
  onSelectStatus,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs animate-pulse">
        <div className="h-5 w-36 rounded bg-slate-200 mb-4" />
        <div className="h-64 w-full rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs text-left flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Resolution Efficiency
        </h3>

        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
          {slaMetrics.complianceRate}% SLA Met
        </span>
      </div>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -24, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {data.map((entry, index) => (
                <Cell
                  key={`bar-${index}`}
                  fill={entry.name === 'Resolved' ? '#10B981' : '#3B82F6'}
                  className="cursor-pointer hover:opacity-85 transition"
                  onClick={() =>
                    onSelectStatus &&
                    onSelectStatus(entry.name === 'Resolved' ? 'RESOLVED' : 'OPEN')
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
