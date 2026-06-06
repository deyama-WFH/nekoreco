import type { BirthDateType, DateString } from '../types/models';

export const toDateString = (date: Date): DateString => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const today = () => toDateString(new Date());
export const parseDate = (value: DateString) => new Date(`${value}T00:00:00`);
export const addDays = (value: DateString, days: number) => {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return toDateString(date);
};
export const daysBetween = (from: DateString, to: DateString) =>
  Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);
export const formatDate = (value?: string | null) =>
  value ? value.replace(/-/g, '/') : '未登録';
export const ageLabel = (birthDate?: string | null, type?: BirthDateType) => {
  if (!birthDate || type === 'unknown') return '年齢不明';
  const birth = parseDate(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return `${type === 'estimated' ? '推定 ' : ''}${Math.max(age, 0)}歳`;
};
export const nextAnniversary = (value: DateString, base = today()) => {
  const [, month, day] = value.split('-').map(Number);
  const year = parseDate(base).getFullYear();
  let candidate = toDateString(new Date(year, (month ?? 1) - 1, day ?? 1));
  if (candidate < base) candidate = toDateString(new Date(year + 1, (month ?? 1) - 1, day ?? 1));
  return candidate;
};
