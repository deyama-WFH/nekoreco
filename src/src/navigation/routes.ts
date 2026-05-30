export const rootRoutes = {
  onboarding: 'OnboardingStack',
  mainTabs: 'MainTabNavigator',
} as const;

export const onboardingRoutes = {
  splash: 'OnboardingSplashScreen',
  welcome: 'OnboardingWelcomeScreen',
  firstCatRegistration: 'FirstCatRegistrationScreen',
  complete: 'CatRegistrationCompleteScreen',
  additionalInfoCategory: 'AdditionalInfoCategoryScreen',
  additionalInfoInput: 'AdditionalInfoInputScreen',
} as const;

export const mainTabs = {
  home: 'HomeStack',
  cats: 'CatStack',
  records: 'RecordStack',
  settings: 'SettingsStack',
} as const;

export const homeRoutes = {
  home: 'HomeScreen',
  todayTaskDetail: 'TodayTaskDetailScreen',
  upcomingPlanDetail: 'UpcomingPlanDetailScreen',
  additionalInfoCategory: 'AdditionalInfoCategoryScreen',
  recordInput: 'RecordInputScreen',
} as const;

export const catRoutes = {
  list: 'CatListScreen',
  detail: 'CatDetailScreen',
  create: 'CatCreateScreen',
  profileEdit: 'CatProfileEditScreen',
  sharePreview: 'SharePreviewScreen',
  recordInput: 'RecordInputScreen',
} as const;

export const recordRoutes = {
  typeSelect: 'RecordTypeSelectScreen',
  catSelect: 'RecordCatSelectScreen',
  input: 'RecordInputScreen',
} as const;

export const settingsRoutes = {
  settings: 'SettingsScreen',
  reminders: 'ReminderSettingsScreen',
  notificationPermission: 'NotificationPermissionScreen',
  familyShareComingSoon: 'FamilyShareComingSoonScreen',
  appInfo: 'AppInfoScreen',
} as const;

export type RootRouteName = (typeof rootRoutes)[keyof typeof rootRoutes];
export type MainTabName = (typeof mainTabs)[keyof typeof mainTabs];
