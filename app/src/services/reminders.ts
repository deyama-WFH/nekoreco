import type {
  Cat,
  CatRecord,
  HomeTask,
  Profiles,
  Reminder,
  ReminderCategorySetting,
  ReminderGlobalSettings,
  ReminderTiming,
  ReminderType,
  UpcomingPlan,
} from '../types/models';
import { addDays, daysBetween, nextAnniversary, today } from '../utils/date';

const timingDays: Record<ReminderTiming, number> = {
  seven_days_before: 7,
  three_days_before: 3,
  one_day_before: 1,
  on_the_day: 0,
  custom: 0,
};

type Source = {
  catId: string;
  type: ReminderType;
  title: string;
  date: string;
  sourceType: Reminder['sourceType'];
  sourceId?: string;
};

export const collectScheduleSources = (
  cats: Cat[],
  profiles: Profiles,
  records: CatRecord[],
  baseDate = today(),
): Source[] => {
  const sources: Source[] = [];
  cats.forEach((cat) => {
    const medical = profiles.medical.find((item) => item.catId === cat.id);
    if (medical?.nextVaccineDate) {
      sources.push({
        catId: cat.id,
        type: 'vaccine',
        title: 'ワクチン予定',
        date: medical.nextVaccineDate,
        sourceType: 'vaccine',
        sourceId: medical.id,
      });
    }
    if (medical?.nextDewormingDate) {
      sources.push({
        catId: cat.id,
        type: 'deworming',
        title: '駆虫薬の予定',
        date: medical.nextDewormingDate,
        sourceType: 'deworming',
        sourceId: medical.id,
      });
    }
    if (medical?.nextHospitalVisitDate) {
      sources.push({
        catId: cat.id,
        type: 'hospital_visit',
        title: '通院予定',
        date: medical.nextHospitalVisitDate,
        sourceType: 'hospital_visit',
        sourceId: medical.id,
      });
    }
    if (cat.birthDate) {
      sources.push({
        catId: cat.id,
        type: 'birthday',
        title: `${cat.name}の誕生日`,
        date: nextAnniversary(cat.birthDate, baseDate),
        sourceType: 'birthday',
        sourceId: cat.id,
      });
    }
    if (cat.adoptionDate) {
      sources.push({
        catId: cat.id,
        type: 'adoption_anniversary',
        title: `${cat.name}のうちの子記念日`,
        date: nextAnniversary(cat.adoptionDate, baseDate),
        sourceType: 'adoption_anniversary',
        sourceId: cat.id,
      });
    }
  });
  records.forEach((record) => {
    if (record.recordType === 'hospital_visit' && record.nextVisitDate) {
      sources.push({
        catId: record.catId,
        type: 'hospital_visit',
        title: '通院予定',
        date: record.nextVisitDate,
        sourceType: 'hospital_visit',
        sourceId: record.id,
      });
    }
    if (
      record.recordType === 'insurance' &&
      ['unclaimed', 'preparing'].includes(record.claimStatus)
    ) {
      sources.push({
        catId: record.catId,
        type: 'insurance_claim',
        title: '保険請求を確認',
        date: addDays(record.recordedAt.slice(0, 10), 3),
        sourceType: 'insurance_claim',
        sourceId: record.id,
      });
    }
    if (record.recordType === 'medication' && !record.isGiven) {
      sources.push({
        catId: record.catId,
        type: 'medication',
        title: `${record.medicationName}を投薬`,
        date: record.recordedAt.slice(0, 10),
        sourceType: 'medication',
        sourceId: record.id,
      });
    }
  });
  return sources;
};

export const buildUpcomingPlans = (
  cats: Cat[],
  profiles: Profiles,
  records: CatRecord[],
  baseDate = today(),
): UpcomingPlan[] =>
  collectScheduleSources(cats, profiles, records, baseDate)
    .filter((source) => daysBetween(baseDate, source.date) >= 0)
    .map((source) => {
      const cat = cats.find((item) => item.id === source.catId);
      return {
        id: `plan-${source.type}-${source.sourceId ?? source.date}`,
        catId: source.catId,
        catName: cat?.name ?? '',
        catPhotoUrl: cat?.photoUrl,
        type: source.type,
        title: source.title,
        scheduledDate: source.date,
        daysUntil: daysBetween(baseDate, source.date),
        sourceId: source.sourceId,
      };
    })
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

export const buildHomeTasks = (
  cats: Cat[],
  profiles: Profiles,
  records: CatRecord[],
  existing: HomeTask[],
  baseDate = today(),
): HomeTask[] => {
  const now = new Date().toISOString();
  const scheduled = collectScheduleSources(cats, profiles, records, baseDate)
    .filter((source) => source.date === baseDate && source.type !== 'insurance_claim')
    .map(
      (source): HomeTask => ({
        id: `task-${source.type}-${source.sourceId ?? source.date}`,
        catId: source.catId,
        type: source.type,
        title: source.title,
        dueDate: source.date,
        status: existing.find((item) => item.id === `task-${source.type}-${source.sourceId ?? source.date}`)
          ?.status ?? 'pending',
        sourceType:
          source.sourceType === 'birthday' || source.sourceType === 'adoption_anniversary'
            ? 'anniversary'
            : source.sourceType === 'weight_record'
              ? 'manual'
              : source.sourceType,
        sourceId: source.sourceId,
        createdAt: now,
        updatedAt: now,
      }),
    );
  const insurance = records
    .filter(
      (
        record,
      ): record is Extract<CatRecord, { recordType: 'insurance' }> =>
        record.recordType === 'insurance' &&
        ['unclaimed', 'preparing'].includes(record.claimStatus),
    )
    .map(
      (record): HomeTask => ({
        id: `task-insurance-${record.id}`,
        catId: record.catId,
        type: 'insurance_claim',
        title: '保険請求を確認',
        description: record.hospitalName ?? undefined,
        dueDate: addDays(record.recordedAt.slice(0, 10), 3),
        status: existing.find((item) => item.id === `task-insurance-${record.id}`)?.status ?? 'pending',
        sourceType: 'insurance_claim',
        sourceId: record.id,
        createdAt: record.createdAt,
        updatedAt: now,
      }),
    )
    .filter((task) => task.dueDate <= baseDate);
  return [...scheduled, ...insurance].filter((task) => task.status === 'pending');
};

export const buildReminders = (
  cats: Cat[],
  profiles: Profiles,
  records: CatRecord[],
  global: ReminderGlobalSettings,
  categories: ReminderCategorySetting[],
  baseDate = today(),
): Reminder[] => {
  if (!global.enabled) return [];
  const now = new Date().toISOString();
  return collectScheduleSources(cats, profiles, records, baseDate).flatMap((source) => {
    const setting = categories.find((item) => item.reminderType === source.type);
    if (!setting?.enabled) return [];
    return setting.timings
      .map((timing) => {
        const days = timing === 'custom' ? setting.customDaysBefore ?? 0 : timingDays[timing];
        const date = addDays(source.date, -days);
        const time = setting.notificationTime ?? global.defaultNotificationTime;
        return {
          id: `reminder-${source.type}-${source.sourceId ?? source.date}-${timing}`,
          catId: source.catId,
          reminderType: source.type,
          title: source.title,
          body: days === 0 ? `今日は${source.title}です` : `${source.title}まであと${days}日です`,
          scheduledAt: `${date}T${time}:00`,
          targetDate: source.date,
          status: 'scheduled' as const,
          sourceType: source.sourceType,
          sourceId: source.sourceId,
          createdAt: now,
          updatedAt: now,
        };
      })
      .filter((reminder) => reminder.scheduledAt.slice(0, 10) >= baseDate);
  });
};
