import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '@/constants/theme';
import { mainTabs } from '@/navigation/routes';
import { CatStack } from '@/navigation/stacks/CatStack';
import { HomeStack } from '@/navigation/stacks/HomeStack';
import { RecordStack } from '@/navigation/stacks/RecordStack';
import { SettingsStack } from '@/navigation/stacks/SettingsStack';
import { MainTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen name={mainTabs.home} component={HomeStack} options={{ title: 'ホーム' }} />
      <Tab.Screen name={mainTabs.cats} component={CatStack} options={{ title: 'ねこ' }} />
      <Tab.Screen name={mainTabs.records} component={RecordStack} options={{ title: '記録' }} />
      <Tab.Screen name={mainTabs.settings} component={SettingsStack} options={{ title: '設定' }} />
    </Tab.Navigator>
  );
}
