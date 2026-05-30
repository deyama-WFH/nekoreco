import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { settingsRoutes } from '@/navigation/routes';
import { SettingsStackParamList } from '@/navigation/types';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={settingsRoutes.settings}
        component={SettingsScreen}
        options={{ title: '設定' }}
      />
      <Stack.Screen name={settingsRoutes.reminders} options={{ title: '通知設定' }}>
        {() => (
          <PlaceholderScreen
            title="通知設定"
            description="カテゴリ別通知設定の仮画面です。"
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={settingsRoutes.notificationPermission} options={{ title: '通知許可' }}>
        {() => (
          <PlaceholderScreen
            title="通知許可"
            description="ローカル通知許可導線の仮画面です。"
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={settingsRoutes.familyShareComingSoon} options={{ title: '家族共有' }}>
        {() => (
          <PlaceholderScreen
            title="家族共有は近日公開"
            description="MVP では本実装せず、Coming Soon として扱います。"
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={settingsRoutes.appInfo} options={{ title: 'アプリ情報' }}>
        {() => (
          <PlaceholderScreen title="アプリ情報" description="MVP v1 の情報表示です。" />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
