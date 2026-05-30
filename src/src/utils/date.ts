import { DateString } from '@/types/models';

export function toDateString(date: Date): DateString {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatJapaneseDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

export function isSameDate(left: Date, right: Date): boolean {
  return toDateString(left) === toDateString(right);
}

export function daysUntil(targetDate: Date, baseDate = new Date()): number {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round((end.getTime() - start.getTime()) / millisecondsPerDay);
}
