import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { AgentWorkloadPoint } from '../../../types/dashboard';

interface AgentWorkloadChartProps {
  data: AgentWorkloadPoint[];
  isLoading?: boolean;
  onSelectAgent?: (agentId: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  agentDataMap?: Map<string, AgentWorkloadPoint>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  agentDataMap,
}) => {
  if (!active || !payload || !payload.length) return null;
  const agent = agentDataMap?.get(label || '');

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm p-3 shadow-lg text-xs space-y-1.5 min-w-[150px]">
      <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
        {label}
      </p>

      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`entry-${index}`} className="flex items-center justify-between gap-3">
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

      {agent && (
        <div className="border-t border-slate-100 pt-1 text-slate-500 text-[11px] flex items-center justify-between">
          <span>Total:</span>
          <span className="font-bold text-slate-800">{agent.totalAssigned}</span>
        </div>
      )}
    </div>
  );
};

export const AgentWorkloadChart: React.FC<AgentWorkloadChartProps> = ({
  data,
  isLoading = false,
  onSelectAgent,
}) => {
  const agentMap = new Map<string, AgentWorkloadPoint>();
  data.forEach((agent) => agentMap.set(agent.agentName, agent));

  const chartData = data.map((a) => ({
    name: a.agentName,
    id: a.agentId,
    Resolved: a.resolvedCount + a.closedCount,
    'In Progress': a.inProgressCount,
    Open: a.openCount,
    total: a.totalAssigned,
    overdue: a.overdueCount,
  }));

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
        <h3 className="text-sm font-bold text-slate-900">Agent Distribution</h3>
      </div>

      <div
        className="mt-4 w-full"
        style={{ height: Math.max(220, chartData.length * 48) }}
      >
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No agent assignments
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 6, right: 16, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />

              <XAxis
                type="number"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                allowDecimals={false}
              />

              <YAxis
                dataKey="name"
                type="category"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={90}
              />

              <Tooltip content={<CustomTooltip agentDataMap={agentMap} />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
              />

              <Bar
                dataKey="Resolved"
                stackId="workload"
                fill="#10B981"
                radius={[0, 0, 0, 0]}
                onClick={(entry: any) =>
                  onSelectAgent && entry?.id && onSelectAgent(entry.id)
                }
                className="cursor-pointer"
              />

              <Bar
                dataKey="In Progress"
                stackId="workload"
                fill="#F59E0B"
                radius={[0, 0, 0, 0]}
                onClick={(entry: any) =>
                  onSelectAgent && entry?.id && onSelectAgent(entry.id)
                }
                className="cursor-pointer"
              />

              <Bar
                dataKey="Open"
                stackId="workload"
                fill="#3B82F6"
                radius={[0, 4, 4, 0]}
                onClick={(entry: any) =>
                  onSelectAgent && entry?.id && onSelectAgent(entry.id)
                }
                className="cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
