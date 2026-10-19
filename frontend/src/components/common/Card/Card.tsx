import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Headphones,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../Button/Button';
import { ROUTES } from '../../../routes/RouteConstants';
import type { TicketStats } from '../../../types/ticket';

export interface CardProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const CardHeader: React.FC<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, description, children, action, className = '' }) => (
  <div
    className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 ${className}`}
  >
    <div>
      {title && (
        <h3 className="text-base font-bold text-slate-900 leading-tight">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      )}
      {children}
    </div>
    {action && <div className="self-start sm:self-auto">{action}</div>}
  </div>
);

export const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 ${className}`}
  >
    {children}
  </div>
);

export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
  Stat: typeof StatCard;
  AgentWorkload: typeof AgentWorkloadCard;
} = ({
  children,
  title,
  description,
  headerRight,
  footer,
  variant = 'default',
  padding = 'md',
  onClick,
  className = '',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    default: 'border-slate-200/80 bg-white shadow-xs',
    elevated: 'border-slate-200/60 bg-white shadow-md shadow-slate-200/50',
    bordered: 'border-slate-200 bg-white shadow-none',
    flat: 'border-transparent bg-slate-50/70 shadow-none',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-2xl border text-left transition-all duration-200 ${
        variantStyles[variant]
      } ${paddingStyles[padding]} ${
        onClick
          ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm'
          : ''
      } ${className}`}
    >
      {(title || description || headerRight) && (
        <CardHeader
          title={title}
          description={description}
          action={headerRight}
          className={children ? 'mb-4' : ''}
        />
      )}
      {children && <CardBody>{children}</CardBody>}
      {footer && <CardFooter className="mt-4">{footer}</CardFooter>}
    </div>
  );
};

export type StatVariant =
  | 'brand'
  | 'forest'
  | 'emerald'
  | 'teal'
  | 'amber'
  | 'rose'
  | 'purple'
  | 'slate'
  | 'blue'
  | 'indigo';

export interface StatCardProps {
  title: string;
  value: number | string;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: StatVariant;
  onClick?: () => void;
  badge?: string;
  isPrimary?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  variant = 'brand',
  onClick,
  badge,
  isPrimary = false,
  className = '',
}) => {
  const variantStyles: Record<
    StatVariant,
    { iconBg: string; text: string; ring: string; badge: string; hoverBorder: string }
  > = {
    brand: {
      iconBg: 'bg-brand-50 text-brand-700',
      text: 'text-brand-700',
      ring: 'ring-brand-500/20',
      badge: 'bg-brand-50 text-brand-700 ring-brand-600/20',
      hoverBorder: 'hover:border-brand-500 hover:shadow-brand-500/10',
    },
    forest: {
      iconBg: 'bg-forest-50 text-forest-700',
      text: 'text-forest-700',
      ring: 'ring-forest-500/20',
      badge: 'bg-forest-50 text-forest-700 ring-forest-600/20',
      hoverBorder: 'hover:border-forest-600 hover:shadow-forest-500/10',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-700',
      text: 'text-emerald-700',
      ring: 'ring-emerald-500/20',
      badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      hoverBorder: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
    },
    teal: {
      iconBg: 'bg-teal-50 text-teal-700',
      text: 'text-teal-700',
      ring: 'ring-teal-500/20',
      badge: 'bg-teal-50 text-teal-700 ring-teal-600/20',
      hoverBorder: 'hover:border-teal-500 hover:shadow-teal-500/10',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-700',
      text: 'text-slate-700',
      ring: 'ring-slate-400/20',
      badge: 'bg-slate-100 text-slate-700 ring-slate-400/20',
      hoverBorder: 'hover:border-slate-400 hover:shadow-slate-500/5',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-700',
      text: 'text-amber-700',
      ring: 'ring-amber-500/20',
      badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      hoverBorder: 'hover:border-amber-500 hover:shadow-amber-500/10',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-700',
      text: 'text-rose-700',
      ring: 'ring-rose-500/20',
      badge: 'bg-rose-50 text-rose-700 ring-rose-600/20',
      hoverBorder: 'hover:border-rose-500 hover:shadow-rose-500/10',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-700',
      text: 'text-purple-700',
      ring: 'ring-purple-500/20',
      badge: 'bg-purple-50 text-purple-700 ring-purple-600/20',
      hoverBorder: 'hover:border-purple-500 hover:shadow-purple-500/10',
    },
    blue: {
      iconBg: 'bg-brand-50 text-brand-700',
      text: 'text-brand-700',
      ring: 'ring-brand-500/20',
      badge: 'bg-brand-50 text-brand-700 ring-brand-600/20',
      hoverBorder: 'hover:border-brand-500 hover:shadow-brand-500/10',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600',
      text: 'text-indigo-600',
      ring: 'ring-indigo-500/20',
      badge: 'bg-indigo-50 text-indigo-600 ring-indigo-600/20',
      hoverBorder: 'hover:border-indigo-500 hover:shadow-indigo-500/10',
    },
  };

  const style = variantStyles[variant] || variantStyles.brand;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      title={onClick ? `Click to view ${title.toLowerCase()} in tickets queue` : undefined}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-4 sm:p-5 text-left transition-all duration-200 ${
        isPrimary
          ? 'border-brand-200/90 shadow-sm shadow-brand-500/5 ring-1 ring-brand-500/10'
          : 'border-slate-200/80 shadow-xs'
      } ${
        onClick
          ? `cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${style.hoverBorder}`
          : ''
      } ${className}`}
    >

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </span>
        {Icon && (
          <div
            className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105 ${style.iconBg} ${style.ring}`}
          >
            <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
        )}
      </div>

     
      <div className="my-2.5 flex items-baseline gap-2">
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
        {badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${style.badge}`}
          >
            {badge}
          </span>
        )}
      </div>

      {description && (
        <div className="flex items-center text-xs text-slate-500 w-full">
          {typeof description === 'string' ? (
            <span className="truncate text-[11px] sm:text-xs text-slate-500">{description}</span>
          ) : (
            description
          )}
        </div>
      )}
    </div>
  );
};

export interface AgentWorkloadCardProps {
  agentName: string;
  stats: TicketStats | null;
}

export const AgentWorkloadCard: React.FC<AgentWorkloadCardProps> = ({
  agentName,
  stats,
}) => {
  const navigate = useNavigate();

  const openTickets = stats?.open ?? 0;
  const inProgressTickets = stats?.inProgress ?? 0;
  const activeQueueCount = openTickets + inProgressTickets;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 text-left shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-500/20">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Agent Workspace
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active session for <span className="font-semibold text-slate-800">{agentName}</span>
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(ROUTES.TICKETS)}
          leftIcon={<Layers className="h-3.5 w-3.5" />}
          rightIcon={<ArrowRight className="h-3.5 w-3.5 ml-0.5" />}
        >
          Open Ticket Queue
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div
          onClick={() => navigate(`${ROUTES.TICKETS}?status=IN_PROGRESS`)}
          className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-amber-300 hover:bg-amber-50/30"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Active Workload</span>
            </div>
            <ArrowRight className="h-3 w-3 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {activeQueueCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Open &amp; in-progress items
          </p>
        </div>

        <div
          onClick={() => navigate(`${ROUTES.TICKETS}?status=RESOLVED`)}
          className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-emerald-300 hover:bg-emerald-50/30"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
              <span>Resolved Items</span>
            </div>
            <ArrowRight className="h-3 w-3 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-700">
            {stats?.resolved ?? 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Successfully closed
          </p>
        </div>

        <div
          onClick={() => navigate(`${ROUTES.TICKETS}?priority=URGENT`)}
          className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-rose-300 hover:bg-rose-50/30"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-rose-500" />
              <span>Urgent Priority</span>
            </div>
            <ArrowRight className="h-3 w-3 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {stats?.urgent ?? 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            High priority SLA tickets
          </p>
        </div>
      </div>
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Stat = StatCard;
Card.AgentWorkload = AgentWorkloadCard;

export default Card;
