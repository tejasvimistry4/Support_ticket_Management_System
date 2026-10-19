import React from 'react';
import {
  ShieldCheck,
  Headphones,
  ArrowDown,
  ArrowUp,
  Flame,
  Minus,
  Clock,
  CheckCircle2,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';
import type { Role } from '../../../types/auth';
import type { TicketPriority, TicketStatus } from '../../../types/ticket';

export interface TicketStatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1 font-medium',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
  };

  switch (status) {
    case 'OPEN':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/25 ${sizeStyles[size]} ${className}`}
        >
          <AlertCircle className={`${iconSizes[size]} text-emerald-600 shrink-0`} />
          <span>Open</span>
        </span>
      );

    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 ${sizeStyles[size]} ${className}`}
        >
          <Clock className={`${iconSizes[size]} text-amber-600 shrink-0 animate-pulse`} />
          <span>In Progress</span>
        </span>
      );

    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${sizeStyles[size]} ${className}`}
        >
          <CheckCircle2 className={`${iconSizes[size]} text-emerald-600 shrink-0`} />
          <span>Resolved</span>
        </span>
      );

    case 'CLOSED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/15 ${sizeStyles[size]} ${className}`}
        >
          <CheckCheck className={`${iconSizes[size]} text-slate-500 shrink-0`} />
          <span>Closed</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/15 ${sizeStyles[size]} ${className}`}
        >
          <span>{status}</span>
        </span>
      );
  }
};


export interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
  className?: string;
}

export const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({
  priority,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1 font-medium',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
  };

  switch (priority) {
    case 'LOW':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/15 ${sizeStyles[size]} ${className}`}
        >
          <ArrowDown className={`${iconSizes[size]} text-slate-500 shrink-0`} />
          <span>Low</span>
        </span>
      );

    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-600/25 ${sizeStyles[size]} ${className}`}
        >
          <Minus className={`${iconSizes[size]} text-teal-600 shrink-0`} />
          <span>Medium</span>
        </span>
      );

    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20 ${sizeStyles[size]} ${className}`}
        >
          <ArrowUp className={`${iconSizes[size]} text-orange-600 shrink-0`} />
          <span>High</span>
        </span>
      );

    case 'URGENT':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/25 ${sizeStyles[size]} ${className}`}
        >
          <Flame className={`${iconSizes[size]} text-rose-600 shrink-0 animate-bounce`} />
          <span className="font-bold">Urgent</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/15 ${sizeStyles[size]} ${className}`}
        >
          <span>{priority}</span>
        </span>
      );
  }
};

export interface BadgeProps {
  role?: Role;
  status?: TicketStatus;
  priority?: TicketPriority;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> & {
  Status: typeof TicketStatusBadge;
  Priority: typeof TicketPriorityBadge;
} = ({
  role,
  status,
  priority,
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}) => {
  if (status) {
    return <TicketStatusBadge status={status} size={size} className={className} />;
  }
  if (priority) {
    return <TicketPriorityBadge priority={priority} size={size} className={className} />;
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
  };

  if (role === 'ADMIN') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20 font-semibold ${sizeStyles[size]} ${className}`}
      >
        <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
        {children || 'ADMIN'}
      </span>
    );
  }

  if (role === 'SUPPORT_AGENT') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 font-semibold ${sizeStyles[size]} ${className}`}
      >
        <Headphones className="h-3.5 w-3.5 text-emerald-600" />
        {children || 'SUPPORT AGENT'}
      </span>
    );
  }

  const variantStyles = {
    primary: 'bg-brand-50 text-brand-700 ring-brand-600/20',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    neutral: 'bg-slate-100 text-slate-700 ring-slate-600/10',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ring-1 ring-inset ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

Badge.Status = TicketStatusBadge;
Badge.Priority = TicketPriorityBadge;

export default Badge;
