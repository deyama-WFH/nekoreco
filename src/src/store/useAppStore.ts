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
  categoryId:
    | 'medical_prevention'
    | 'hospital_insurance'
    | 'food'
    | 'care_notes'
    | 'anniversary_notifications',
  values: Record<string, string | boolean | null>,
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
      medicalNotes: String(values.medicalNote ?? values.medicalHistory ?? '') || null,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };
    setState({
      medicalProfiles: [
        ...state.medicalProfiles.filter((profileItem) => profileItem.catId !== catId),
        profile,
      ],
    });
  }

  if (categoryId === 'hospital_insurance') {
    const current = state.insuranceProfiles.find((profile) => profile.catId === catId);
    const profile: CatInsuranceProfile = {
      id: current?.id ?? createId('insurance'),
      catId,
      providerName: String(values.insuranceName ?? '') || null,
      policyNumber: String(values.insurancePolicyNumber ?? '') || null,
      coverageNotes: String(values.insuranceNote ?? values.insurancePlan ?? '') || null,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };
    setState({
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
      stapleFoodName: String(values.regularFood ?? '') || null,
      favoriteFood: String(values.favoriteFood ?? '') || null,
      allergyNotes: String(values.foodAllergies ?? '') || null,
      feedingNotes: String(values.foodNote ?? values.dislikedFood ?? '') || null,
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
      personalityNotes: String(values.personality ?? '') || null,
      careNotes: String(values.medicationNote ?? '') || null,
      awayNotes: String(values.awayCareNote ?? '') || null,
      familyNotes: String(values.familyNote ?? values.dislikes ?? '') || null,
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
