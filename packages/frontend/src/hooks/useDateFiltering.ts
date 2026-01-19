import { useState, useCallback, useMemo } from 'react';
import { addDays, addWeeks, addMonths, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * Hook for date range filtering
 * Platform-agnostic - works for both React Web and React Native
 */

export type DateFilterPreset =
  | ''
  | 'today'
  | 'tomorrow'
  | 'this-week'
  | 'next-week'
  | 'next-3-weeks'
  | 'this-month'
  | 'next-month'
  | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface UseDateFilteringReturn {
  selectedDate: DateFilterPreset;
  customDateFrom: Date | undefined;
  customDateTo: Date | undefined;
  showCustomDatePicker: boolean;
  dateRange: DateRange | null;
  setSelectedDate: (preset: DateFilterPreset) => void;
  setCustomDateFrom: (date: Date | undefined) => void;
  setCustomDateTo: (date: Date | undefined) => void;
  setShowCustomDatePicker: (show: boolean) => void;
  isDateInRange: (date: Date | string | null | undefined) => boolean;
  resetDateFilter: () => void;
}

/**
 * Get date range based on preset
 */
const getDateRangeForPreset = (preset: DateFilterPreset): DateRange | null => {
  const now = new Date();
  const today = startOfDay(now);

  switch (preset) {
    case 'today':
      return {
        from: today,
        to: endOfDay(today),
      };
    case 'tomorrow':
      const tomorrow = addDays(today, 1);
      return {
        from: tomorrow,
        to: endOfDay(tomorrow),
      };
    case 'this-week':
      return {
        from: today,
        to: addWeeks(today, 1),
      };
    case 'next-week':
      const nextWeekStart = addWeeks(today, 1);
      return {
        from: nextWeekStart,
        to: addWeeks(nextWeekStart, 1),
      };
    case 'next-3-weeks':
      return {
        from: today,
        to: addWeeks(today, 3),
      };
    case 'this-month':
      return {
        from: today,
        to: addMonths(today, 1),
      };
    case 'next-month':
      const nextMonthStart = addMonths(today, 1);
      return {
        from: nextMonthStart,
        to: addMonths(nextMonthStart, 1),
      };
    default:
      return null;
  }
};

/**
 * Hook for managing date range filtering
 */
export const useDateFiltering = (
  initialPreset: DateFilterPreset = 'next-3-weeks'
): UseDateFilteringReturn => {
  const [selectedDate, setSelectedDate] = useState<DateFilterPreset>(initialPreset);
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>();
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>();
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Calculate the active date range
  const dateRange = useMemo<DateRange | null>(() => {
    if (selectedDate === 'custom') {
      if (customDateFrom && customDateTo) {
        return {
          from: startOfDay(customDateFrom),
          to: endOfDay(customDateTo),
        };
      }
      return null;
    }

    return getDateRangeForPreset(selectedDate);
  }, [selectedDate, customDateFrom, customDateTo]);

  const isDateInRange = useCallback(
    (date: Date | string | null | undefined): boolean => {
      if (!date) return false;
      // If no date selected or no date range, show all dates
      if (!selectedDate || selectedDate === '' || !dateRange) return true;

      const dateObj = typeof date === 'string' ? new Date(date) : date;

      try {
        return isWithinInterval(dateObj, {
          start: dateRange.from,
          end: dateRange.to,
        });
      } catch (error) {
        console.error('Error checking date range:', error);
        return false;
      }
    },
    [selectedDate, dateRange]
  );

  const resetDateFilter = useCallback(() => {
    setSelectedDate('');
    setCustomDateFrom(undefined);
    setCustomDateTo(undefined);
    setShowCustomDatePicker(false);
  }, []);

  return {
    selectedDate,
    customDateFrom,
    customDateTo,
    showCustomDatePicker,
    dateRange,
    setSelectedDate,
    setCustomDateFrom,
    setCustomDateTo,
    setShowCustomDatePicker,
    isDateInRange,
    resetDateFilter,
  };
};
