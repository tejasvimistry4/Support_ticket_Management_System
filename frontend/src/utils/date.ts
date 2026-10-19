export const formatDate = (
  date: string | Date | number | undefined | null,
  options?: Intl.DateTimeFormatOptions,
): string => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(undefined, options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
};

export const formatDateTime = (
  date: string | Date | number | undefined | null,
): string => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

export const formatRelativeTime = (
  date: string | Date | number | undefined | null,
): string => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    }
    return formatDate(d);
  } catch {
    return '-';
  }
};

export const formatForDateTimeLocal = (
  date?: string | Date | number | null,
): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

export const SLA_HOURS_MAP: Record<string, number> = {
  URGENT: 24,
  HIGH: 48,
  MEDIUM: 72,
  LOW: 120,
};

export const isTicketOverdue = (ticket: {
  status: string;
  priority: string;
  createdAt: string | Date;
  dueDate?: string | Date | null;
}): boolean => {
  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    return false;
  }
  const now = Date.now();
  if (ticket.dueDate) {
    const dueTime = new Date(ticket.dueDate).getTime();
    return !isNaN(dueTime) && now > dueTime;
  }
  const slaHours = SLA_HOURS_MAP[ticket.priority] ?? 72;
  const createdTime = new Date(ticket.createdAt).getTime();
  return !isNaN(createdTime) && now > createdTime + slaHours * 60 * 60 * 1000;
};

