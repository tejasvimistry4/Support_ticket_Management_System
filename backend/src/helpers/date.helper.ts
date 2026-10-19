export function formatDuration(hours: number): string {
  if (!hours || hours <= 0) return '0 hrs';
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60));
    return `${mins} min${mins === 1 ? '' : 's'}`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)} hrs`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getWeekNumber(date: Date): {
  year: number;
  week: number;
  label: string;
} {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return {
    year: d.getUTCFullYear(),
    week: weekNo,
    label: `W${weekNo}`,
  };
}


export function getDateRangeBounds(
  timeRange: string = '7d',
  customStart?: string,
  customEnd?: string,
  now: Date = new Date(),
): { startDate: Date; endDate: Date } {
  let startDate: Date;
  let endDate: Date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  if (customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
    if (isNaN(startDate.getTime())) {
      startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    }
    if (isNaN(endDate.getTime())) {
      endDate = new Date();
    }
  } else if (timeRange === '7d') {
    startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
  } else if (timeRange === '30d') {
    startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
  } else if (timeRange === '90d') {
    startDate = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
}
