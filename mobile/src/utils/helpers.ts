import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date: string | Date | undefined, fmt = 'MMM dd, yyyy'): string => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isValid(d) ? format(d, fmt) : '-';
  } catch {
    return '-';
  }
};

export const formatDateTime = (date: string | Date | undefined): string =>
  formatDate(date, 'MMM dd, yyyy HH:mm');

export const formatPercent = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0%';
  return `${Number(value).toFixed(1)}%`;
};

export const formatHours = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0h';
  return `${Number(value).toFixed(1)}h`;
};

export const getInitials = (firstName: string, lastName: string): string =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

export const getFullName = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`.trim();

export const truncate = (str: string, len = 50): string =>
  str.length > len ? `${str.substring(0, len)}...` : str;

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    Active: '#4CAF50',
    Inactive: '#9E9E9E',
    Completed: '#2196F3',
    'On Hold': '#FF9800',
    Cancelled: '#F44336',
    Planned: '#9C27B0',
    'To Do': '#9E9E9E',
    'In Progress': '#2196F3',
    'In Review': '#FF9800',
    Done: '#4CAF50',
    Blocked: '#F44336',
    Draft: '#9E9E9E',
    Submitted: '#2196F3',
    Reviewed: '#FF9800',
    Approved: '#4CAF50',
  };
  return map[status] || '#9E9E9E';
};

export const extractApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
    const data = axiosError.response?.data;
    if (data?.errors?.length) return data.errors.join(', ');
    if (data?.message) return data.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

export const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
