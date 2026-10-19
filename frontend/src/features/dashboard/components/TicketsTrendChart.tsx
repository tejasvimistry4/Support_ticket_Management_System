import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { TicketsOverTimePoint } from '../../../types/dashboard';

interface TicketsTrendChartProps {
  data: TicketsOverTimePoint[];
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm p-3 shadow-lg text-xs space-y-1.5 min-w-[130px]">
      <p className="font-semibold text-slate-800 border-b border-slate-100 pb-1">
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-500 font-medium">{entry.name}:</span>
          </div>
          <span className="font-bold text-slate-900 tabular-nums">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const TicketsTrendChart: React.FC<TicketsTrendChartProps> = ({
  data,
  isLoading = false,
}) => {
  const totalCreated = data.reduce((acc, curr) => acc + curr.created, 0);
  const totalResolved = data.reduce((acc, curr) => acc + curr.resolved, 0);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs animate-pulse">
        <div className="h-5 w-32 rounded bg-slate-200 mb-4" />
        <div className="h-64 w-full rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs text-left">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Volume Trend</h3>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            Created {totalCreated}
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Resolved {totalResolved}
          </span>
        </div>
      </div>

      <div className="mt-5 h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No activity in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 6, left: -24, bottom: 0 }}
            >
              <defs>
                <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

              <XAxis
                dataKey="label"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                interval="preserveStartEnd"
              />

              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
              />

              <Area
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#createdGradient)"
                activeDot={{ r: 4, stroke: '#6366F1', strokeWidth: 2, fill: '#FFFFFF' }}
              />

              <Area
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#resolvedGradient)"
                activeDot={{ r: 4, stroke: '#10B981', strokeWidth: 2, fill: '#FFFFFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
