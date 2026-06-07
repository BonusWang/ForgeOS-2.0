import { format, startOfWeek, addDays, addWeeks, isSameWeek as dfIsSameWeek, getDay } from 'date-fns';
import type { DayColumn } from '../types';

export const getTodayString = (): string => format(new Date(), 'yyyy-MM-dd');

export const getWeekStart = (date: Date = new Date()): string => {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
};

export const getWeekDates = (weekStart: string): string[] => {
  const dates: string[] = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    dates.push(format(addDays(start, i), 'yyyy-MM-dd'));
  }
  return dates;
};

export const getNextWeekStart = (weekStart: string): string => {
  return format(addWeeks(new Date(weekStart), 1), 'yyyy-MM-dd');
};

export const getPrevWeekStart = (weekStart: string): string => {
  return format(addWeeks(new Date(weekStart), -1), 'yyyy-MM-dd');
};

export const isSameWeek = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return dfIsSameWeek(d1, d2, { weekStartsOn: 1 });
};

export const getDayColumnFromDate = (date: Date = new Date()): DayColumn => {
  const dayNames: DayColumn[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dayIndex = getDay(date);
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return dayNames[adjustedIndex];
};

export const getPreviousDayColumn = (column: DayColumn): DayColumn | undefined => {
  const prevMap: Record<string, DayColumn | undefined> = {
    MON: undefined,
    TUE: 'MON',
    WED: 'TUE',
    THU: 'WED',
    FRI: 'THU',
    SAT: 'FRI',
    SUN: 'SAT',
  };
  return prevMap[column];
};

export const getDateLabelForDay = (day: DayColumn): string => {
  const labels: Record<string, string> = {
    MON: '周一',
    TUE: '周二',
    WED: '周三',
    THU: '周四',
    FRI: '周五',
    SAT: '周六',
    SUN: '周日',
  };
  return labels[day] || day;
};

export const formatLocalDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'M月d日 HH:mm');
};
