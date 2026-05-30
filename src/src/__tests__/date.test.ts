import { describe, expect, test } from 'bun:test';

import { toDateString } from '@/utils/date';

describe('date utilities', () => {
  test('formats a local date as YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 4, 30))).toBe('2026-05-30');
  });
});
