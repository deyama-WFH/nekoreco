import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { catRoutes } from '@/navigation/routes';
import { CatStackParamList } from '@/navigation/types';
import {
  CatCreateScreen,
  CatDetailScreen,
  CatListScreen,
  CatProfileEditScreen,
  SharePreviewScreen,
} from '@/screens/CatListScreen';
import { RecordInputScreen } from '@/screens/RecordScreens';

const Stack = createNativeStackNavigator<CatStackParamList>();

export function CatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={catRoutes.list}
        component={CatListScreen}
        options={{ title: 'ねこ一覧' }}
      />
      <Stack.Screen
        name={catRoutes.detail}
        component={CatDetailScreen}
        options={{ title: '猫詳細' }}
      />
      <Stack.Screen
        name={catRoutes.create}
        component={CatCreateScreen}
        options={{ title: '猫追加' }}
      />
      <Stack.Screen
        name={catRoutes.profileEdit}
        component={CatProfileEditScreen}
        options={{ title: 'プロフィール編集' }}
      />
      <Stack.Screen
        name={catRoutes.sharePreview}
        component={SharePreviewScreen}
        options={{ title: '家族共有' }}
      />
      <Stack.Screen
        name={catRoutes.recordInput}
        component={RecordInputScreen}
        options={{ title: 'この子の記録' }}
      />
    </Stack.Navigator>
  );
}
