import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { homeRoutes } from '@/navigation/routes';
import { HomeStackParamList } from '@/navigation/types';
import { HomeScreen } from '@/screens/HomeScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name={homeRoutes.home} component={HomeScreen} options={{ title: 'ホーム' }} />
      <Stack.Screen name={homeRoutes.todayTaskDetail} options={{ title: '今日やること' }}>
        {() => (
          <PlaceholderScreen
            title="今日やること詳細"
            description="タスク詳細確認用の仮画面です。"
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={homeRoutes.upcomingPlanDetail} options={{ title: '近日の予定' }}>
        {() => (
          <PlaceholderScreen title="近日の予定詳細" description="予定詳細確認用の仮画面です。" />
        )}
      </Stack.Screen>
      <Stack.Screen name={homeRoutes.additionalInfoCategory} options={{ title: '情報追加' }}>
        {() => (
          <PlaceholderScreen
            title="情報追加カテゴリ"
            description="不足情報の案内カードから遷移します。"
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={homeRoutes.recordInput} options={{ title: '記録入力' }}>
        {() => (
          <PlaceholderScreen
            title="記録入力"
            description="ホームからのクイック記録入力仮画面です。"
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
