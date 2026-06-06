import { addDays, daysBetween, nextAnniversary } from '../date';

test('date calculations use calendar days', () => {
  expect(addDays('2026-06-06', 7)).toBe('2026-06-13');
  expect(daysBetween('2026-06-06', '2026-06-13')).toBe(7);
});

test('anniversary rolls to the next year', () => {
  expect(nextAnniversary('2020-01-10', '2026-06-06')).toBe('2027-01-10');
});
