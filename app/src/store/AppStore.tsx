import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { buildHomeTasks, buildReminders, buildUpcomingPlans } from '../services/reminders';
import type {
  Cat,
  CatRecord,
  HomeTask,
  Profiles,
  ReminderCategorySetting,
  ReminderGlobalSettings,
} from '../types/models';
import {
  defaultReminderCategorySettings,
  defaultReminderGlobalSettings,
  emptyProfiles,
} from './defaults';

const STORAGE_KEY = '@nekoreco/state/v1';
const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type PersistedState = {
  hasCompletedOnboarding: boolean;
  cats: Cat[];
  profiles: Profiles;
  records: CatRecord[];
  tasks: HomeTask[];
  reminderGlobal: ReminderGlobalSettings;
  reminderCategories: ReminderCategorySetting[];
};

const initialState: PersistedState = {
  hasCompletedOnboarding: false,
  cats: [],
  profiles: emptyProfiles,
  records: [],
  tasks: [],
  reminderGlobal: defaultReminderGlobalSettings,
  reminderCategories: defaultReminderCategorySettings,
};

type Store = PersistedState & {
  isHydrated: boolean;
  addCat: (input: Omit<Cat, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCat: (catId: string, patch: Partial<Cat>) => void;
  completeOnboarding: () => void;
  addRecord: (record: CatRecord) => void;
  updateProfiles: (profiles: Profiles) => void;
  setTaskStatus: (id: string, status: HomeTask['status']) => void;
  setReminderGlobal: (patch: Partial<ReminderGlobalSettings>) => void;
  setReminderCategory: (type: ReminderCategorySetting['reminderType'], enabled: boolean) => void;
  resetAllData: () => Promise<void>;
  createRecordId: () => string;
};

const AppStoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) setState({ ...initialState, ...(JSON.parse(stored) as PersistedState) });
      })
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (isHydrated) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  const addCat = useCallback((input: Omit<Cat, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = createId('cat');
    const timestamp = new Date().toISOString();
    setState((current) => ({
      ...current,
      cats: [...current.cats, { ...input, id, createdAt: timestamp, updatedAt: timestamp }],
    }));
    return id;
  }, []);

  const value = useMemo<Store>(() => {
    const upcomingPlans = buildUpcomingPlans(state.cats, state.profiles, state.records);
    const tasks = buildHomeTasks(state.cats, state.profiles, state.records, state.tasks);
    buildReminders(
      state.cats,
      state.profiles,
      state.records,
      state.reminderGlobal,
      state.reminderCategories,
    );
    return {
      ...state,
      tasks,
      isHydrated,
      addCat,
      updateCat: (catId, patch) =>
        setState((current) => ({
          ...current,
          cats: current.cats.map((cat) =>
            cat.id === catId ? { ...cat, ...patch, updatedAt: new Date().toISOString() } : cat,
          ),
        })),
      completeOnboarding: () =>
        setState((current) => ({ ...current, hasCompletedOnboarding: true })),
      addRecord: (record) =>
        setState((current) => {
          let profiles = current.profiles;
          if (record.recordType === 'hospital_visit' && record.nextVisitDate) {
            const found = profiles.medical.find((item) => item.catId === record.catId);
            const timestamp = new Date().toISOString();
            const medical = found
              ? profiles.medical.map((item) =>
                  item.catId === record.catId
                    ? { ...item, nextHospitalVisitDate: record.nextVisitDate, updatedAt: timestamp }
                    : item,
                )
              : [
                  ...profiles.medical,
                  {
                    id: createId('medical'),
                    catId: record.catId,
                    nextHospitalVisitDate: record.nextVisitDate,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                  },
                ];
            profiles = { ...profiles, medical };
          }
          return { ...current, profiles, records: [record, ...current.records] };
        }),
      updateProfiles: (profiles) => setState((current) => ({ ...current, profiles })),
      setTaskStatus: (id, status) =>
        setState((current) => ({
          ...current,
          tasks: buildHomeTasks(current.cats, current.profiles, current.records, current.tasks).map(
            (task) => (task.id === id ? { ...task, status, updatedAt: new Date().toISOString() } : task),
          ),
        })),
      setReminderGlobal: (patch) =>
        setState((current) => ({
          ...current,
          reminderGlobal: {
            ...current.reminderGlobal,
            ...patch,
            updatedAt: new Date().toISOString(),
          },
        })),
      setReminderCategory: (type, enabled) =>
        setState((current) => ({
          ...current,
          reminderCategories: current.reminderCategories.map((item) =>
            item.reminderType === type
              ? { ...item, enabled, updatedAt: new Date().toISOString() }
              : item,
          ),
        })),
      resetAllData: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setState(initialState);
      },
      createRecordId: () => createId('record'),
      upcomingPlans,
    } as Store & { upcomingPlans: typeof upcomingPlans };
  }, [addCat, isHydrated, state]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export const useAppStore = () => {
  const context = useContext(AppStoreContext);
  if (!context) throw new Error('useAppStore must be used within AppStoreProvider');
  return context;
};
