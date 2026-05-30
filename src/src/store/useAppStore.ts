import { useSyncExternalStore } from 'react';

type AppStoreState = {
  hasCompletedOnboarding: boolean;
};

type Listener = (state: AppStoreState) => void;

let state: AppStoreState = {
  hasCompletedOnboarding: false,
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
    useSyncExternalStore(subscribe, () => selector(state), () => selector(state)),
  {
    getState,
    setState,
    subscribe,
  },
);
