import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { LoadingScreen } from '../components/ui';
import {
  CatCreateScreen,
  CatDetailScreen,
  CatListScreen,
  CatProfileEditScreen,
} from '../screens/CatScreens';
import {
  HomeAdditionalInfoCategoryScreen,
  HomeAdditionalInfoInputScreen,
  HomeScreen,
  TodayTaskDetailScreen,
  UpcomingPlanDetailScreen,
} from '../screens/HomeScreens';
import {
  AdditionalInfoCategoryScreen,
  AdditionalInfoInputScreen,
  CatRegistrationCompleteScreen,
  FirstCatRegistrationScreen,
  OnboardingSplashScreen,
  OnboardingWelcomeScreen,
} from '../screens/OnboardingScreens';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { useAppStore } from '../store/AppStore';
import { colors } from '../theme';
import type {
  CatStackParamList,
  HomeStackParamList,
  MainTabParamList,
  OnboardingStackParamList,
  RecordStackParamList,
  SettingsStackParamList,
} from './types';

const Root = createNativeStackNavigator();
const Onboarding = createNativeStackNavigator<OnboardingStackParamList>();
const Home = createNativeStackNavigator<HomeStackParamList>();
const Cat = createNativeStackNavigator<CatStackParamList>();
const Record = createNativeStackNavigator<RecordStackParamList>();
const Settings = createNativeStackNavigator<SettingsStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const placeholder = (title: string) => () => <PlaceholderScreen title={title} />;

function OnboardingNavigator() {
  return (
    <Onboarding.Navigator screenOptions={{ headerShown: false }}>
      <Onboarding.Screen name="OnboardingSplash" component={OnboardingSplashScreen} />
      <Onboarding.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
      <Onboarding.Screen name="FirstCatRegistration" component={FirstCatRegistrationScreen} />
      <Onboarding.Screen name="CatRegistrationComplete" component={CatRegistrationCompleteScreen} />
      <Onboarding.Screen name="AdditionalInfoCategory" component={AdditionalInfoCategoryScreen} />
      <Onboarding.Screen name="AdditionalInfoInput" component={AdditionalInfoInputScreen} />
    </Onboarding.Navigator>
  );
}

function HomeNavigator() {
  return (
    <Home.Navigator>
      <Home.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Home.Screen name="TodayTaskDetail" component={TodayTaskDetailScreen} options={{ title: '今日やること' }} />
      <Home.Screen name="UpcomingPlanDetail" component={UpcomingPlanDetailScreen} options={{ title: '近日の予定' }} />
      <Home.Screen name="HomeRecordTypeSelect" component={placeholder('記録を選ぶ')} />
      <Home.Screen name="HomeRecordCatSelect" component={placeholder('猫を選ぶ')} />
      <Home.Screen name="HomeRecordInput" component={placeholder('記録する')} />
      <Home.Screen name="HomeAdditionalInfoCategory" component={HomeAdditionalInfoCategoryScreen} options={{ title: '情報を追加' }} />
      <Home.Screen name="HomeAdditionalInfoInput" component={HomeAdditionalInfoInputScreen} options={{ title: '情報を入力' }} />
    </Home.Navigator>
  );
}

function CatNavigator() {
  return (
    <Cat.Navigator>
      <Cat.Screen name="CatList" component={CatListScreen} options={{ headerShown: false }} />
      <Cat.Screen name="CatDetail" component={CatDetailScreen} options={{ title: '猫の詳細' }} />
      <Cat.Screen name="CatCreate" component={CatCreateScreen} options={{ title: '猫ちゃんを追加' }} />
      <Cat.Screen name="CatProfileEdit" component={CatProfileEditScreen} options={{ title: 'プロフィール編集' }} />
      <Cat.Screen name="CatRecordTypeSelect" component={placeholder('記録を選ぶ')} />
      <Cat.Screen name="CatRecordInput" component={placeholder('記録する')} />
      <Cat.Screen name="FamilyShareComingSoon" component={placeholder('家族共有')} />
    </Cat.Navigator>
  );
}

function RecordNavigator() {
  return (
    <Record.Navigator>
      <Record.Screen
        name="RecordTypeSelect"
        component={placeholder('記録する')}
        options={{ headerShown: false }}
      />
      <Record.Screen name="RecordCatSelect" component={placeholder('猫を選ぶ')} />
      <Record.Screen name="RecordInput" component={placeholder('記録する')} />
    </Record.Navigator>
  );
}

function SettingsNavigator() {
  return (
    <Settings.Navigator>
      <Settings.Screen
        name="Settings"
        component={placeholder('設定')}
        options={{ headerShown: false }}
      />
      <Settings.Screen name="ReminderSettings" component={placeholder('通知設定')} />
      <Settings.Screen name="NotificationPermission" component={placeholder('通知の許可')} />
      <Settings.Screen
        name="SettingsFamilyShareComingSoon"
        component={placeholder('家族共有')}
      />
      <Settings.Screen name="AppInfo" component={placeholder('アプリ情報')} />
    </Settings.Navigator>
  );
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? colors.primary : colors.muted, fontSize: 12, fontWeight: '700' }}>
      {label}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { height: 66, paddingBottom: 8, paddingTop: 8 },
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{ title: 'ホーム', tabBarIcon: ({ focused }) => <TabIcon label="HOME" focused={focused} /> }}
      />
      <Tabs.Screen
        name="CatTab"
        component={CatNavigator}
        options={{ title: 'ねこ', tabBarIcon: ({ focused }) => <TabIcon label="CATS" focused={focused} /> }}
      />
      <Tabs.Screen
        name="RecordTab"
        component={RecordNavigator}
        options={{
          title: '記録',
          tabBarIcon: ({ focused }) => <TabIcon label="ADD" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="SettingsTab"
        component={SettingsNavigator}
        options={{
          title: '設定',
          tabBarIcon: ({ focused }) => <TabIcon label="SET" focused={focused} />,
        }}
      />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { hasCompletedOnboarding, isHydrated } = useAppStore();
  if (!isHydrated) return <LoadingScreen />;
  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      {hasCompletedOnboarding ? (
        <Root.Screen name="Main" component={MainTabs} />
      ) : (
        <Root.Screen name="Onboarding" component={OnboardingNavigator} />
      )}
    </Root.Navigator>
  );
}
