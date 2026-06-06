import { buildHomeTasks, buildReminders, buildUpcomingPlans } from '../reminders';
import { defaultReminderCategorySettings, defaultReminderGlobalSettings, emptyProfiles } from '../../store/defaults';
import type { Cat, Profiles } from '../../types/models';

const cat: Cat = {
  id: 'cat-1',
  name: 'りお',
  sex: 'male',
  birthDate: '2020-06-13',
  birthDateType: 'exact',
  adoptionDate: '2021-06-06',
  adoptionDateType: 'exact',
  breedType: 'unknown',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const profiles: Profiles = {
  ...emptyProfiles,
  medical: [
    {
      id: 'medical-1',
      catId: cat.id,
      nextVaccineDate: '2026-06-13',
      nextDewormingDate: '2026-06-06',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ],
};

test('builds upcoming plans and same-day tasks independently of notification setting', () => {
  expect(buildUpcomingPlans([cat], profiles, [], '2026-06-06')).toEqual(
    expect.arrayContaining([expect.objectContaining({ type: 'vaccine', daysUntil: 7 })]),
  );
  expect(buildHomeTasks([cat], profiles, [], [], '2026-06-06')).toEqual(
    expect.arrayContaining([expect.objectContaining({ type: 'deworming' })]),
  );
});

test('builds vaccine reminders using default timings', () => {
  const reminders = buildReminders(
    [cat],
    profiles,
    [],
    defaultReminderGlobalSettings,
    defaultReminderCategorySettings,
    '2026-06-06',
  );
  expect(reminders).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        reminderType: 'vaccine',
        scheduledAt: '2026-06-06T09:00:00',
      }),
    ]),
  );
});

test('insurance reminders start three days after an unclaimed record', () => {
  const record = {
    id: 'insurance-1',
    catId: cat.id,
    recordType: 'insurance' as const,
    recordedAt: '2026-06-03T10:00:00',
    claimStatus: 'unclaimed' as const,
    createdAt: '2026-06-03T10:00:00',
    updatedAt: '2026-06-03T10:00:00',
  };
  const tasks = buildHomeTasks([cat], emptyProfiles, [record], [], '2026-06-06');
  expect(tasks).toEqual(
    expect.arrayContaining([expect.objectContaining({ type: 'insurance_claim' })]),
  );
});
