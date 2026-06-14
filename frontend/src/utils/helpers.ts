import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date?: string | Date, fmt = 'MMM dd, yyyy'): string => {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, fmt) : '—';
  } catch { return '—'; }
};

export const formatDateTime = (date?: string | Date): string =>
  formatDate(date, 'MMM dd, yyyy HH:mm');

export const formatPercent = (v?: number | null): string =>
  v == null ? '0%' : `${Number(v).toFixed(1)}%`;

export const formatHours = (v?: number | null): string =>
  v == null ? '0h' : `${Number(v).toFixed(1)}h`;

export const getInitials = (first: string, last: string): string =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

export const truncate = (s: string, len = 60): string =>
  s?.length > len ? `${s.substring(0, len)}…` : s;

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    Active: '#2e7d32', Inactive: '#757575', Completed: '#1565c0',
    'On Hold': '#e65100', Cancelled: '#c62828', Planned: '#6a1b9a',
    'To Do': '#757575', 'In Progress': '#1565c0', 'In Review': '#e65100',
    Done: '#2e7d32', Blocked: '#c62828',
    Draft: '#757575', Submitted: '#1565c0', Reviewed: '#e65100', Approved: '#2e7d32',
  };
  return map[status] ?? '#757575';
};

export const getStatusBg = (status: string): string => {
  const map: Record<string, string> = {
    Active: '#e8f5e9', Inactive: '#f5f5f5', Completed: '#e3f2fd',
    'On Hold': '#fff3e0', Cancelled: '#ffebee', Planned: '#f3e5f5',
    'To Do': '#f5f5f5', 'In Progress': '#e3f2fd', 'In Review': '#fff3e0',
    Done: '#e8f5e9', Blocked: '#ffebee',
    Draft: '#f5f5f5', Submitted: '#e3f2fd', Reviewed: '#fff3e0', Approved: '#e8f5e9',
  };
  return map[status] ?? '#f5f5f5';
};

export const extractApiError = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const e = error as { response?: { data?: { message?: string; errors?: string[] } }; message?: string };
    if (e.response?.data?.errors?.length) return e.response.data.errors.join(', ');
    if (e.response?.data?.message) return e.response.data.message;
    if (e.message) return e.message;
  }
  return 'An unexpected error occurred';
};

export const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, ms: number) => {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');
