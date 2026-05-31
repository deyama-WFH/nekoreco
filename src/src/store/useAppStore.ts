import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockReminderSettings } from '@/store/mockData';
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
  ReminderTiming,
  ReminderType,
} from '@/types/models';

const STORAGE_KEY = 'nekoreco:v1:app-store';

type AppStoreState = {
  hasHydrated: boolean;
  hasCompletedOnboarding: boolean;
  cats: Cat[];
  medicalProfiles: CatMedicalProfile[];
  foodProfiles: CatFoodProfile[];
  insuranceProfiles: CatInsuranceProfile[];
  careProfiles: CatCareProfile[];
  records: CatRecord[];
  schedules: CatSchedule[];
  tasks: HomeTask[];
  reminderSettings: ReminderSetting[];
};

type Listener = (state: AppStoreState) => void;
type PersistedAppStoreState = Omit<AppStoreState, 'hasHydrated'>;
type NewCatInput = Omit<Cat, 'id' | 'createdAt' | 'updatedAt'>;
type AdditionalInfoCategoryId =
  | 'medical_prevention'
  | 'hospital_insurance'
  | 'food'
  | 'care_notes'
  | 'anniversary_notifications';
type AdditionalInfoValue = string | boolean | null;

let state: AppStoreState = {
  hasHydrated: false,
  hasCompletedOnboarding: false,
  cats: [],
  medicalProfiles: [],
  foodProfiles: [],
  insuranceProfiles: [],
  careProfiles: [],
  records: [],
  schedules: [],
  tasks: [],
  reminderSettings: mockReminderSettings,
};

const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getState() {
  return state;
}

function setState(partial: Partial<AppStoreState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener(state));
}

function getPersistedState(): PersistedAppStoreState {
  return {
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    cats: state.cats,
    medicalProfiles: state.medicalProfiles,
    foodProfiles: state.foodProfiles,
    insuranceProfiles: state.insuranceProfiles,
    careProfiles: state.careProfiles,
    records: state.records,
    schedules: state.schedules,
    tasks: state.tasks,
    reminderSettings: state.reminderSettings,
  };
}

async function persistState() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistedState()));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nullableString(value: AdditionalInfoValue | undefined) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function booleanValue(value: AdditionalInfoValue | undefined, defaultValue = true) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (['false', 'off', '0', 'no'].includes(normalized)) {
    return false;
  }

  if (['true', 'on', '1', 'yes'].includes(normalized)) {
    return true;
  }

  return defaultValue;
}

function upsertReminderSetting(
  settings: ReminderSetting[],
  type: ReminderType,
  enabled: boolean,
  timings: ReminderTiming[],
  now: string,
) {
  const current = settings.find((setting) => setting.type === type);
  const nextSetting: ReminderSetting = {
    id: current?.id ?? createId(`reminder-${type}`),
    type,
    enabled,
    timings: current?.timings.length ? current.timings : timings,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };

  return [...settings.filter((setting) => setting.type !== type), nextSetting];
}

function upsertSchedule(
  schedules: CatSchedule[],
  catId: string,
  type: ReminderType,
  dueDate: string | null,
  title: string,
  now: string,
) {
  const remainingSchedules = schedules.filter(
    (schedule) => !(schedule.catId === catId && schedule.type === type),
  );

  if (!dueDate) {
    return remainingSchedules;
  }

  const current = schedules.find((schedule) => schedule.catId === catId && schedule.type === type);
  const schedule: CatSchedule = {
    id: current?.id ?? createId(`schedule-${type}`),
    catId,
    type,
    dueDate,
    title,
    status: current?.status ?? 'scheduled',
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };

  return [...remainingSchedules, schedule];
}

export async function hydrateAppStore() {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (storedValue) {
    const persistedState = JSON.parse(storedValue) as PersistedAppStoreState;
    setState({ ...persistedState, hasHydrated: true });
    return;
  }

  setState({
    hasHydrated: true,
    hasCompletedOnboarding: false,
    cats: [],
    medicalProfiles: [],
    foodProfiles: [],
    insuranceProfiles: [],
    careProfiles: [],
    records: [],
    schedules: [],
    tasks: [],
    reminderSettings: mockReminderSettings,
  });
}

export async function addFirstCat(input: NewCatInput) {
  const now = new Date().toISOString();
  const cat: Cat = {
    ...input,
    id: createId('cat'),
    createdAt: now,
    updatedAt: now,
  };

  setState({ cats: [...state.cats, cat] });
  await persistState();

  return cat;
}

export async function completeOnboarding() {
  setState({ hasCompletedOnboarding: true });
  await persistState();
}

export async function saveAdditionalInfo(
  catId: string,
  categoryId: AdditionalInfoCategoryId,
  values: Record<string, AdditionalInfoValue>,
) {
  const now = new Date().toISOString();

  if (categoryId === 'medical_prevention') {
    const current = state.medicalProfiles.find((profile) => profile.catId === catId);
    const profile: CatMedicalProfile = {
      id: current?.id ?? createId('medical'),
      catId,
      sterilizationStatus:
        values.sterilizationStatus === 'done' ||
        values.sterilizationStatus === 'not_done' ||
        values.sterilizationStatus === 'unknown'
          ? values.sterilizationStatus
          : 'unknown',
      primaryHospitalName: current?.primaryHospitalName ?? null,
      primaryDoctorName: current?.primaryDoctorName ?? null,
      hospitalPhoneNumber: current?.hospitalPhoneNumber ?? null,
      medicalHistory: nullableString(values.medicalHistory),
      latestVaccineDate: nullableString(values.vaccineDate),
      nextVaccineDate: nullableString(values.nextVaccineDate),
      latestDewormingDate: nullableString(values.dewormingDate),
      nextDewormingDate: nullableString(values.nextDewormingDate),
      medicalNote: nullableString(values.medicalNote),
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };
    const nextSchedules = upsertSchedule(
      upsertSchedule(
        state.schedules,
        catId,
        'vaccine',
        profile.nextVaccineDate,
        'ワクチン予定',
        now,
      ),
      catId,
      'deworming',
      profile.nextDewormingDate,
      '駆虫薬予定',
      now,
    );
    setState({
      medicalProfiles: [
        ...state.medicalProfiles.filter((profileItem) => profileItem.catId !== catId),
        profile,
      ],
      schedules: nextSchedules,
    });
  }

  if (categoryId === 'hospital_insurance') {
    const currentMedical = state.medicalProfiles.find((profile) => profile.catId === catId);
    const medicalProfile: CatMedicalProfile = {
      id: currentMedical?.id ?? createId('medical'),
      catId,
      sterilizationStatus: currentMedical?.sterilizationStatus ?? 'unknown',
      primaryHospitalName: nullableString(values.primaryHospitalName),
      primaryDoctorName: nullableString(values.primaryDoctorName),
      hospitalPhoneNumber: nullableString(values.hospitalPhoneNumber),
      medicalHistory: currentMedical?.medicalHistory ?? null,
      latestVaccineDate: currentMedical?.latestVaccineDate ?? null,
      nextVaccineDate: currentMedical?.nextVaccineDate ?? null,
      latestDewormingDate: currentMedical?.latestDewormingDate ?? null,
      nextDewormingDate: currentMedical?.nextDewormingDate ?? null,
      medicalNote: currentMedical?.medicalNote ?? null,
      createdAt: currentMedical?.createdAt ?? now,
      updatedAt: now,
    };
    const current = state.insuranceProfiles.find((profile) => profile.catId === catId);
    const profile: CatInsuranceProfile = {
      id: current?.id ?? createId('insurance'),
      catId,
      insuranceName: nullableString(values.insuranceName),
      insurancePlan: nullableString(values.insurancePlan),
      insurancePolicyNumber: nullableString(values.insurancePolicyNumber),
      insuranceNote: nullableString(values.insuranceNote),
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };
    setState({
      medicalProfiles: [
        ...state.medicalProfiles.filter((profileItem) => profileItem.catId !== catId),
        medicalProfile,
      ],
      insuranceProfiles: [
        ...state.insuranceProfiles.filter((profileItem) => profileItem.catId !== catId),
        profile,
      ],
    });
  }

  if (categoryId === 'food') {
    const current = state.foodProfiles.find((profile) => profile.catId === catId);
    const profile: CatFoodProfile = {
      id: current?.id ?? createId('food'),
      catId,
      regularFood: nullableString(values.regularFood),
      favoriteFood: nullableString(values.favoriteFood),
      dislikedFood: nullableString(values.dislikedFood),
      foodAllergies: nullableString(values.foodAllergies),
      foodNote: nullableString(values.foodNote),
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };
    setState({
      foodProfiles: [
        ...state.foodProfiles.filter((profileItem) => profileItem.catId !== catId),
        profile,
      ],
    });
  }

  if (categoryId === 'care_notes') {
    const current = state.careProfiles.find((profile) => profile.catId === catId);
    const profile: CatCareProfile = {
      id: current?.id ?? createId('care'),
      catId,
      hasMedication: booleanValue(values.hasMedication, current?.hasMedication ?? false),
      medicationNote: nullableString(values.medicationNote),
      personality: nullableString(values.personality),
      dislikes: nullableString(values.dislikes),
      awayCareNote: nullableString(values.awayCareNote),
      familyNote: nullableString(values.familyNote),
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };
    setState({
      careProfiles: [
        ...state.careProfiles.filter((profileItem) => profileItem.catId !== catId),
        profile,
      ],
    });
  }

  if (categoryId === 'anniversary_notifications') {
    const birthdayEnabled = booleanValue(values.birthdayReminderEnabled);
    const adoptionEnabled = booleanValue(values.adoptionReminderEnabled);
    const vaccineEnabled = booleanValue(values.vaccineReminderEnabled);
    const dewormingEnabled = booleanValue(values.dewormingReminderEnabled);
    const hospitalVisitEnabled = booleanValue(values.hospitalVisitReminderEnabled);
    const nextReminderSettings = [
      {
        type: 'birthday' as const,
        enabled: birthdayEnabled,
        timings: ['seven_days_before', 'on_the_day'] as ReminderTiming[],
      },
      {
        type: 'adoption_anniversary' as const,
        enabled: adoptionEnabled,
        timings: ['seven_days_before', 'on_the_day'] as ReminderTiming[],
      },
      {
        type: 'vaccine' as const,
        enabled: vaccineEnabled,
        timings: ['seven_days_before', 'one_day_before', 'on_the_day'] as ReminderTiming[],
      },
      {
        type: 'deworming' as const,
        enabled: dewormingEnabled,
        timings: ['three_days_before', 'on_the_day'] as ReminderTiming[],
      },
      {
        type: 'hospital_visit' as const,
        enabled: hospitalVisitEnabled,
        timings: ['one_day_before', 'on_the_day'] as ReminderTiming[],
      },
    ].reduce(
      (settings, setting) =>
        upsertReminderSetting(settings, setting.type, setting.enabled, setting.timings, now),
      state.reminderSettings,
    );

    setState({ reminderSettings: nextReminderSettings });
  }

  await persistState();
}

export const useAppStore = Object.assign(
  <T>(selector: (currentState: AppStoreState) => T): T =>
    useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state),
    ),
  {
    getState,
    setState,
    subscribe,
    addFirstCat,
    completeOnboarding,
    hydrateAppStore,
    saveAdditionalInfo,
  },
);
