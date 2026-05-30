import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { recordRoutes } from '@/navigation/routes';
import { RecordStackParamList } from '@/navigation/types';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { RecordTypeSelectScreen } from '@/screens/RecordTypeSelectScreen';

const Stack = createNativeStackNavigator<RecordStackParamList>();

export function RecordStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={recordRoutes.typeSelect}
        component={RecordTypeSelectScreen}
        options={{ title: '記録' }}
      />
      <Stack.Screen name={recordRoutes.catSelect} options={{ title: '猫選択' }}>
        {() => (
          <PlaceholderScreen
            title="どの子の記録ですか？"
            description="ホームや記録タブから対象猫を選ぶ仮画面です。"
            actions={[{ label: '入力へ', routeName: recordRoutes.input }]}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={recordRoutes.input} options={{ title: '記録入力' }}>
        {() => (
          <PlaceholderScreen
            title="記録入力"
            description="記録タイプに応じた入力 UI を後続で実装します。"
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
