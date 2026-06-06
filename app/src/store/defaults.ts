import type {
  Profiles,
  ReminderCategorySetting,
  ReminderGlobalSettings,
  ReminderType,
} from '../types/models';

const now = new Date().toISOString();

export const emptyProfiles: Profiles = { medical: [], food: [], insurance: [], care: [] };

export const defaultReminderGlobalSettings: ReminderGlobalSettings = {
  id: 'reminder-global',
  enabled: true,
  defaultNotificationTime: '09:00',
  createdAt: now,
  updatedAt: now,
};

const timings: Record<ReminderType, ReminderCategorySetting['timings']> = {
  vaccine: ['seven_days_before', 'one_day_before', 'on_the_day'],
  deworming: ['three_days_before', 'on_the_day'],
  hospital_visit: ['one_day_before', 'on_the_day'],
  medication: ['on_the_day'],
  birthday: ['seven_days_before', 'on_the_day'],
  adoption_anniversary: ['seven_days_before', 'on_the_day'],
  insurance_claim: ['three_days_before'],
  weight_record: [],
  care: [],
};

export const defaultReminderCategorySettings = Object.entries(timings).map(
  ([reminderType, reminderTimings], index): ReminderCategorySetting => ({
    id: `reminder-category-${index}`,
    reminderType: reminderType as ReminderType,
    enabled: !['weight_record', 'care'].includes(reminderType),
    timings: reminderTimings,
    createdAt: now,
    updatedAt: now,
  }),
);
