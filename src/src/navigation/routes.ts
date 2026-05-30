export const rootRoutes = {
  onboarding: 'OnboardingStack',
  mainTabs: 'MainTabNavigator',
} as const;

export const mainTabs = {
  home: 'HomeStack',
  cats: 'CatStack',
  records: 'RecordStack',
  settings: 'SettingsStack',
} as const;

export type RootRouteName = (typeof rootRoutes)[keyof typeof rootRoutes];
export type MainTabName = (typeof mainTabs)[keyof typeof mainTabs];
