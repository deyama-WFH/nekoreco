import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { recordRoutes } from '@/navigation/routes';
import { RecordStackParamList } from '@/navigation/types';
import {
  RecordCatSelectScreen,
  RecordInputScreen,
  RecordTypeSelectScreen,
} from '@/screens/RecordScreens';

const Stack = createNativeStackNavigator<RecordStackParamList>();

export function RecordStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={recordRoutes.typeSelect}
        component={RecordTypeSelectScreen}
        options={{ title: '記録' }}
      />
      <Stack.Screen
        name={recordRoutes.catSelect}
        component={RecordCatSelectScreen}
        options={{ title: '猫選択' }}
      />
      <Stack.Screen
        name={recordRoutes.input}
        component={RecordInputScreen}
        options={{ title: '記録入力' }}
      />
    </Stack.Navigator>
  );
}
