import type { NavigatorScreenParams } from '@react-navigation/native';
import type { RecordType } from '../types/models';

export type CatDetailTab = 'overview' | 'medical' | 'food' | 'timeline' | 'insurance' | 'memo';
export type RecordSource = 'home' | 'record_tab' | 'cat_detail';
export type AdditionalInfoCategory =
  | 'medical_prevention'
  | 'hospital_insurance'
  | 'food'
  | 'care_notes'
  | 'anniversary_notifications';

export type OnboardingStackParamList = {
  OnboardingSplash: undefined;
  OnboardingWelcome: undefined;
  FirstCatRegistration: undefined;
  CatRegistrationComplete: { catId: string };
  AdditionalInfoCategory: { catId: string; source: 'onboarding' };
  AdditionalInfoInput: { catId: string; categoryId: AdditionalInfoCategory };
};
export type HomeStackParamList = {
  Home: undefined;
  TodayTaskDetail: { taskId: string };
  UpcomingPlanDetail: { planId: string };
  HomeRecordTypeSelect: { source: 'home' };
  HomeRecordCatSelect: { source: 'home'; recordType: RecordType };
  HomeRecordInput: { source: 'home'; catId: string; recordType: RecordType };
  HomeAdditionalInfoCategory: { catId: string; source: 'home' };
  HomeAdditionalInfoInput: { catId: string; categoryId: AdditionalInfoCategory };
};
export type CatStackParamList = {
  CatList: undefined;
  CatDetail: { catId: string; initialTab?: CatDetailTab };
  CatCreate: undefined;
  CatProfileEdit: { catId: string };
  CatRecordTypeSelect: { source: 'cat_detail'; catId: string };
  CatRecordInput: { source: 'cat_detail'; catId: string; recordType: RecordType };
  FamilyShareComingSoon: { catId?: string; source: 'cat_detail' };
};
export type RecordStackParamList = {
  RecordTypeSelect: { source: 'record_tab' } | undefined;
  RecordCatSelect: { source: 'record_tab'; recordType: RecordType };
  RecordInput: { source: 'record_tab'; catId: string; recordType: RecordType };
};
export type SettingsStackParamList = {
  Settings: undefined;
  ReminderSettings: undefined;
  NotificationPermission: undefined;
  SettingsFamilyShareComingSoon: { source: 'settings' };
  AppInfo: undefined;
};
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CatTab: NavigatorScreenParams<CatStackParamList>;
  RecordTab: NavigatorScreenParams<RecordStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};
