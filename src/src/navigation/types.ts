import { NavigatorScreenParams } from '@react-navigation/native';

import {
  catRoutes,
  homeRoutes,
  mainTabs,
  onboardingRoutes,
  recordRoutes,
  rootRoutes,
  settingsRoutes,
} from '@/navigation/routes';

export type OnboardingStackParamList = {
  [onboardingRoutes.splash]: undefined;
  [onboardingRoutes.welcome]: undefined;
  [onboardingRoutes.firstCatRegistration]: undefined;
  [onboardingRoutes.complete]: { catId: string };
  [onboardingRoutes.additionalInfoCategory]: { catId: string; source: 'onboarding' };
  [onboardingRoutes.additionalInfoInput]: {
    catId: string;
    categoryId:
      | 'medical_prevention'
      | 'hospital_insurance'
      | 'food'
      | 'care_notes'
      | 'anniversary_notifications';
  };
};

export type HomeStackParamList = {
  [homeRoutes.home]: undefined;
  [homeRoutes.todayTaskDetail]: { taskId?: string } | undefined;
  [homeRoutes.upcomingPlanDetail]: { scheduleId?: string } | undefined;
  [homeRoutes.additionalInfoCategory]: undefined;
  [homeRoutes.recordInput]: { catId?: string; recordType?: string } | undefined;
};

export type CatStackParamList = {
  [catRoutes.list]: undefined;
  [catRoutes.detail]: { catId?: string } | undefined;
  [catRoutes.create]: undefined;
  [catRoutes.profileEdit]: { catId?: string } | undefined;
  [catRoutes.sharePreview]: { catId?: string } | undefined;
  [catRoutes.recordInput]: { catId?: string } | undefined;
};

export type RecordStackParamList = {
  [recordRoutes.typeSelect]: undefined;
  [recordRoutes.catSelect]: undefined;
  [recordRoutes.input]: { catId?: string; recordType?: string } | undefined;
};

export type SettingsStackParamList = {
  [settingsRoutes.settings]: undefined;
  [settingsRoutes.reminders]: undefined;
  [settingsRoutes.notificationPermission]: undefined;
  [settingsRoutes.familyShareComingSoon]: undefined;
  [settingsRoutes.appInfo]: undefined;
};

export type MainTabParamList = {
  [mainTabs.home]: NavigatorScreenParams<HomeStackParamList> | undefined;
  [mainTabs.cats]: NavigatorScreenParams<CatStackParamList> | undefined;
  [mainTabs.records]: NavigatorScreenParams<RecordStackParamList> | undefined;
  [mainTabs.settings]: NavigatorScreenParams<SettingsStackParamList> | undefined;
};

export type RootStackParamList = {
  [rootRoutes.onboarding]: NavigatorScreenParams<OnboardingStackParamList> | undefined;
  [rootRoutes.mainTabs]: NavigatorScreenParams<MainTabParamList> | undefined;
};
