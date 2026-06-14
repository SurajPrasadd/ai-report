import {
  formatDate, formatPercent, formatHours, getInitials,
  getFullName, truncate, getStatusColor, extractApiError,
} from '../utils/helpers';

describe('helpers', () => {
  describe('formatDate', () => {
    it('formats a valid ISO date', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
    });
    it('returns — for undefined', () => {
      expect(formatDate(undefined)).toBe('-');
    });
    it('returns — for invalid date', () => {
      expect(formatDate('not-a-date')).toBe('-');
    });
  });

  describe('formatPercent', () => {
    it('formats number as percentage', () => {
      expect(formatPercent(62.5)).toBe('62.5%');
    });
    it('returns 0% for null', () => {
      expect(formatPercent(null)).toBe('0%');
    });
    it('returns 0% for undefined', () => {
      expect(formatPercent(undefined)).toBe('0%');
    });
  });

  describe('formatHours', () => {
    it('formats hours correctly', () => {
      expect(formatHours(8)).toBe('8.0h');
      expect(formatHours(2.5)).toBe('2.5h');
    });
    it('returns 0h for null', () => {
      expect(formatHours(null)).toBe('0h');
    });
  });

  describe('getInitials', () => {
    it('returns uppercase initials', () => {
      expect(getInitials('John', 'Smith')).toBe('JS');
    });
    it('handles single char names', () => {
      expect(getInitials('A', 'B')).toBe('AB');
    });
  });

  describe('getFullName', () => {
    it('joins first and last name', () => {
      expect(getFullName('John', 'Smith')).toBe('John Smith');
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      const long = 'a'.repeat(100);
      expect(truncate(long, 50)).toHaveLength(53); // 50 + '...'
    });
    it('does not truncate short strings', () => {
      expect(truncate('short', 50)).toBe('short');
    });
  });

  describe('getStatusColor', () => {
    it('returns green for Active', () => {
      expect(getStatusColor('Active')).toBe('#4CAF50');
    });
    it('returns red for Cancelled', () => {
      expect(getStatusColor('Cancelled')).toBe('#F44336');
    });
    it('returns grey for unknown', () => {
      expect(getStatusColor('Unknown')).toBe('#9E9E9E');
    });
  });

  describe('extractApiError', () => {
    it('extracts message from axios error', () => {
      const error = { response: { data: { message: 'Unauthorized' } } };
      expect(extractApiError(error)).toBe('Unauthorized');
    });
    it('extracts from Error object', () => {
      expect(extractApiError(new Error('Test error'))).toBe('Test error');
    });
    it('returns default for unknown error', () => {
      expect(extractApiError(null)).toBe('An unexpected error occurred');
    });
  });
});
