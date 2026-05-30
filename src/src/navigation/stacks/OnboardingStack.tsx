import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { onboardingRoutes } from '@/navigation/routes';
import { OnboardingStackParamList } from '@/navigation/types';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name={onboardingRoutes.splash} options={{ title: 'スプラッシュ' }}>
        {() => (
          <PlaceholderScreen
            title="ねこレコ"
            description="オンボーディング開始前の仮画面です。"
            actions={[{ label: 'ウェルカムへ', routeName: onboardingRoutes.welcome }]}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={onboardingRoutes.welcome} options={{ title: 'ウェルカム' }}>
        {() => (
          <PlaceholderScreen
            title="ねこレコへようこそ"
            description="最初の猫登録へ進む導線です。"
            actions={[
              { label: '最初の猫を登録', routeName: onboardingRoutes.firstCatRegistration },
            ]}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={onboardingRoutes.firstCatRegistration} options={{ title: '猫登録' }}>
        {() => (
          <PlaceholderScreen
            title="最初の猫ちゃんを登録"
            description="Phase 2 で登録フォームを実装します。"
            actions={[{ label: '登録完了へ', routeName: onboardingRoutes.complete }]}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={onboardingRoutes.complete} options={{ title: '登録完了' }}>
        {() => (
          <PlaceholderScreen
            title="登録完了"
            description="詳細情報入力かホーム遷移を選ぶ仮画面です。"
            actions={[
              { label: '詳しい情報へ', routeName: onboardingRoutes.additionalInfoCategory },
            ]}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name={onboardingRoutes.additionalInfoCategory}
        options={{ title: '詳細カテゴリ' }}
      >
        {() => (
          <PlaceholderScreen
            title="詳細情報カテゴリ"
            description="医療、ごはん、保険、お世話情報の入口です。"
            actions={[{ label: '入力画面へ', routeName: onboardingRoutes.additionalInfoInput }]}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={onboardingRoutes.additionalInfoInput} options={{ title: '詳細入力' }}>
        {() => (
          <PlaceholderScreen
            title="詳細情報入力"
            description="Phase 2 以降で入力 UI を追加します。"
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
