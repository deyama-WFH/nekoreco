import {
  Cat,
  CatCareProfile,
  CatFoodProfile,
  CatInsuranceProfile,
  CatMedicalProfile,
  CatRecord,
  CatSchedule,
  HomeTask,
  ReminderSetting,
} from '@/types/models';
import { addDays, toDateString } from '@/utils/date';

const nowDate = new Date();
const now = nowDate.toISOString();
const today = toDateString(nowDate);
const inThreeDays = toDateString(addDays(nowDate, 3));
const inSevenDays = toDateString(addDays(nowDate, 7));

export const mockCats: Cat[] = [
  {
    id: 'cat-rio',
    name: 'りお',
    photoUrl: null,
    sex: 'male',
    birthDate: '2019-04-12',
    birthDateType: 'estimated',
    adoptionDate: '2020-06-01',
    adoptionDateType: 'exact',
    breed: null,
    breedType: 'mixed',
    coatColorPattern: 'キジ白',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-maru',
    name: 'まる',
    photoUrl: null,
    sex: 'female',
    birthDate: '2021-09-20',
    birthDateType: 'exact',
    adoptionDate: '2021-12-10',
    adoptionDateType: 'exact',
    breed: null,
    breedType: 'mixed',
    coatColorPattern: '三毛',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-sora',
    name: 'そら',
    photoUrl: null,
    sex: 'unknown',
    birthDate: null,
    birthDateType: 'unknown',
    adoptionDate: '2024-06-02',
    adoptionDateType: 'exact',
    breed: null,
    breedType: 'unknown',
    coatColorPattern: null,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockMedicalProfiles: CatMedicalProfile[] = [
  {
    id: 'medical-rio',
    catId: 'cat-rio',
    sterilizationStatus: 'done',
    primaryHospitalName: 'ねこれこ動物病院',
    primaryDoctorName: null,
    medicalNotes: 'ワクチン予定を管理中',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockFoodProfiles: CatFoodProfile[] = [
  {
    id: 'food-rio',
    catId: 'cat-rio',
    stapleFoodName: '総合栄養食チキン',
    favoriteFood: 'ウェットタイプ',
    allergyNotes: null,
    feedingNotes: '朝は少なめ',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockInsuranceProfiles: CatInsuranceProfile[] = [
  {
    id: 'insurance-rio',
    catId: 'cat-rio',
    providerName: 'ねこ保険',
    policyNumber: null,
    coverageNotes: '通院補償あり',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockCareProfiles: CatCareProfile[] = [
  {
    id: 'care-rio',
    catId: 'cat-rio',
    personalityNotes: '慎重だが甘えん坊',
    careNotes: 'ブラッシングは短時間で',
    awayNotes: '来客時は隠れやすい',
    familyNotes: '投薬後にごほうび',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockTasks: HomeTask[] = [
  {
    id: 'task-maru-hospital',
    catId: 'cat-maru',
    type: 'hospital_visit',
    title: '通院予定日です',
    dueDate: today,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-rio-insurance',
    catId: 'cat-rio',
    type: 'insurance_claim',
    title: '保険請求が未対応です',
    dueDate: today,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-sora-anniversary',
    catId: 'cat-sora',
    type: 'adoption_anniversary',
    title: 'うちの子記念日が近づいています',
    dueDate: today,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockSchedules: CatSchedule[] = [
  {
    id: 'schedule-rio-vaccine',
    catId: 'cat-rio',
    type: 'vaccine',
    dueDate: inThreeDays,
    title: 'ワクチン予定',
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'schedule-maru-deworming',
    catId: 'cat-maru',
    type: 'deworming',
    dueDate: inSevenDays,
    title: '駆虫予定',
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'schedule-maru-birthday',
    catId: 'cat-maru',
    type: 'birthday',
    dueDate: '2026-09-20',
    title: '誕生日',
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockRecords: CatRecord[] = [
  {
    id: 'record-rio-weight',
    catId: 'cat-rio',
    type: 'weight',
    recordDate: '2026-05-29',
    weightKg: 4.8,
    memo: '診察室で測定',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'record-rio-food',
    catId: 'cat-rio',
    type: 'food',
    recordDate: today,
    foodName: 'チキンドライ',
    status: 'ate',
    brand: 'NekoReco',
    flavor: 'チキン',
    memo: null,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockReminderSettings: ReminderSetting[] = [
  {
    id: 'reminder-vaccine',
    type: 'vaccine',
    enabled: true,
    timings: ['seven_days_before', 'one_day_before', 'on_the_day'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'reminder-deworming',
    type: 'deworming',
    enabled: true,
    timings: ['three_days_before', 'on_the_day'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'reminder-insurance',
    type: 'insurance_claim',
    enabled: false,
    timings: ['three_days_before'],
    createdAt: now,
    updatedAt: now,
  },
];
