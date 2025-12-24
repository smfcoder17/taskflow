import { DayOfWeek } from './models';

/* Utility function to check if two dates are on the same day */
export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.toDateString() === d2.toDateString();
};

export const weekDays: { index: number; label: string; value: DayOfWeek }[] = [
  { index: 0, label: 'Monday', value: 'mon' },
  {
    label: 'Tuesday',
    value: 'tue',
    index: 1,
  },
  {
    label: 'Wednesday',
    value: 'wed',
    index: 2,
  },
  {
    label: 'Thursday',
    value: 'thu',
    index: 3,
  },
  {
    label: 'Friday',
    value: 'fri',
    index: 4,
  },
  {
    label: 'Saturday',
    value: 'sat',
    index: 5,
  },
  {
    label: 'Sunday',
    value: 'sun',
    index: 6,
  },
];

// Get DayOfWeek from Date
export const getDayOfWeek = (date: Date): DayOfWeek => {
  const dayIndex = date.getDay(); // 0 (Sun) to 6 (Sat)
  switch (dayIndex) {
    case 0:
      return 'sun';
    case 1:
      return 'mon';
    case 2:
      return 'tue';
    case 3:
      return 'wed';
    case 4:
      return 'thu';
    case 5:
      return 'fri';
    case 6:
      return 'sat';
    default:
      throw new Error('Invalid day index');
  }
};

export const DateUtils = {
  isSameDay,
  getDayOfWeek,
  weekDays,
};
