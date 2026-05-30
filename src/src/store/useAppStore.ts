import { useSyncExternalStore } from 'react';

import {
  mockCareProfiles,
  mockCats,
  mockFoodProfiles,
  mockInsuranceProfiles,
  mockMedicalProfiles,
  mockRecords,
  mockReminderSettings,
  mockSchedules,
  mockTasks,
} from '@/store/mockData';
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

type AppStoreState = {
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

let state: AppStoreState = {
  hasCompletedOnboarding: true,
  cats: mockCats,
  medicalProfiles: mockMedicalProfiles,
  foodProfiles: mockFoodProfiles,
  insuranceProfiles: mockInsuranceProfiles,
  careProfiles: mockCareProfiles,
  records: mockRecords,
  schedules: mockSchedules,
  tasks: mockTasks,
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
  },
);
