import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Button } from '../../../components/common';
import type { PriorityDistributionPoint } from '../../../types/dashboard';

interface PriorityDistributionChartProps {
  data: PriorityDistributionPoint[];
  isLoading?: boolean;
  onSelectPriority?: (priority: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PriorityDistributionPoint;
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
        <span>{point.label}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-slate-500">
        <span>Count:</span>
        <span className="font-bold text-slate-900">{point.count}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-slate-500">
        <span>Share:</span>
        <span className="font-bold text-slate-900">{point.percentage}%</span>
      </div>
    </div>
  );
};

export const PriorityDistributionChart: React.FC<PriorityDistributionChartProps> = ({
  data,
  isLoading = false,
  onSelectPriority,
}) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs animate-pulse">
        <div className="h-5 w-28 rounded bg-slate-200 mb-4" />
        <div className="h-64 w-full rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs text-left flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Priority Breakdown</h3>
        <span className="text-xs font-semibold text-slate-400 tabular-nums">
          {total} total
        </span>
      </div>

      <div className="relative mt-3 h-48 w-full flex items-center justify-center">
        {total === 0 ? (
          <div className="text-xs text-slate-400">No tickets</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={76}
                  paddingAngle={3}
                  cornerRadius={4}
                  dataKey="count"
                  onClick={(entry: any) =>
                    onSelectPriority &&
                    entry?.priority &&
                    onSelectPriority(entry.priority)
                  }
                  className="cursor-pointer focus:outline-none"
                >
                  {data.map((entry) => (
                    <Cell
                      key={`cell-${entry.priority}`}
                      fill={entry.color}
                      stroke="transparent"
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {total}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-xs">
        {data.map((item) => (
          <Button
            key={item.priority}
            type="button"
            variant="unstyled"
            onClick={() => onSelectPriority && onSelectPriority(item.priority)}
            className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600 font-medium">{item.label}</span>
            </div>
            <span className="font-bold text-slate-800 tabular-nums">
              {item.count}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
