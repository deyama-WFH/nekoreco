import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { catRoutes } from '@/navigation/routes';
import { CatStackParamList } from '@/navigation/types';
import { CatListScreen } from '@/screens/CatListScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';

const Stack = createNativeStackNavigator<CatStackParamList>();

export function CatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={catRoutes.list}
        component={CatListScreen}
        options={{ title: 'ねこ一覧' }}
      />
      <Stack.Screen name={catRoutes.detail} options={{ title: '猫詳細' }}>
        {() => (
          <PlaceholderScreen
            title="猫詳細"
            description="概要、医療、ごはん、履歴、保険、メモの6タブを後続で実装します。"
            actions={[
              { label: 'プロフィール編集', routeName: catRoutes.profileEdit },
              { label: '共有プレビュー', routeName: catRoutes.sharePreview },
              { label: 'この子の記録を追加', routeName: catRoutes.recordInput },
            ]}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={catRoutes.create} options={{ title: '猫追加' }}>
        {() => (
          <PlaceholderScreen
            title="猫ちゃんを追加"
            description="複数猫登録フォームの仮画面です。"
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={catRoutes.profileEdit} options={{ title: 'プロフィール編集' }}>
        {() => (
          <PlaceholderScreen
            title="プロフィール編集"
            description="Cat は基本プロフィールのみ編集します。"
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={catRoutes.sharePreview} options={{ title: '共有プレビュー' }}>
        {() => (
          <PlaceholderScreen
            title="共有プレビュー"
            description="MVP では本実装せず、導線のみ配置します。"
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={catRoutes.recordInput} options={{ title: 'この子の記録' }}>
        {() => (
          <PlaceholderScreen
            title="この子の記録入力"
            description="猫詳細からは猫選択をスキップします。"
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
