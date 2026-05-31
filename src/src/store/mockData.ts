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

const now = '2026-05-30T00:00:00.000Z';

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
];

export const mockMedicalProfiles: CatMedicalProfile[] = [
  {
    id: 'medical-rio',
    catId: 'cat-rio',
    sterilizationStatus: 'done',
    primaryHospitalName: 'ねこれこ動物病院',
    primaryDoctorName: null,
    hospitalPhoneNumber: null,
    medicalHistory: null,
    latestVaccineDate: null,
    nextVaccineDate: '2026-06-05',
    latestDewormingDate: null,
    nextDewormingDate: null,
    medicalNote: 'ワクチン予定を管理中',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockFoodProfiles: CatFoodProfile[] = [
  {
    id: 'food-rio',
    catId: 'cat-rio',
    regularFood: '総合栄養食チキン',
    favoriteFood: 'ウェットタイプ',
    dislikedFood: null,
    foodAllergies: null,
    foodNote: '朝は少なめ',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockInsuranceProfiles: CatInsuranceProfile[] = [
  {
    id: 'insurance-rio',
    catId: 'cat-rio',
    insuranceName: 'ねこ保険',
    insurancePlan: '通院補償あり',
    insurancePolicyNumber: null,
    insuranceNote: null,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockCareProfiles: CatCareProfile[] = [
  {
    id: 'care-rio',
    catId: 'cat-rio',
    hasMedication: true,
    medicationNote: '投薬後にごほうび',
    personality: '慎重だが甘えん坊',
    dislikes: null,
    awayCareNote: '来客時は隠れやすい',
    familyNote: '投薬後にごほうび',
    createdAt: now,
    updatedAt: now,
  },
];

export const mockTasks: HomeTask[] = [
  {
    id: 'task-rio-vaccine',
    catId: 'cat-rio',
    type: 'vaccine',
    title: 'ワクチン予定が近づいています',
    dueDate: '2026-06-05',
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
    dueDate: '2026-06-05',
    title: 'ワクチン予定',
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
    recordDate: '2026-05-30',
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
];
