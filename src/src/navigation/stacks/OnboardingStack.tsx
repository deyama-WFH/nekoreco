import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { onboardingRoutes } from '@/navigation/routes';
import { OnboardingStackParamList } from '@/navigation/types';
import {
  AdditionalInfoCategoryScreen,
  AdditionalInfoInputScreen,
  CatRegistrationCompleteScreen,
  FirstCatRegistrationScreen,
  OnboardingSplashScreen,
  OnboardingWelcomeScreen,
} from '@/screens/OnboardingScreens';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={onboardingRoutes.splash}
        component={OnboardingSplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={onboardingRoutes.welcome}
        component={OnboardingWelcomeScreen}
        options={{ title: 'ようこそ' }}
      />
      <Stack.Screen
        name={onboardingRoutes.firstCatRegistration}
        component={FirstCatRegistrationScreen}
        options={{ title: '猫登録' }}
      />
      <Stack.Screen
        name={onboardingRoutes.complete}
        component={CatRegistrationCompleteScreen}
        options={{ title: '登録完了' }}
      />
      <Stack.Screen
        name={onboardingRoutes.additionalInfoCategory}
        component={AdditionalInfoCategoryScreen}
        options={{ title: '詳しい情報' }}
      />
      <Stack.Screen
        name={onboardingRoutes.additionalInfoInput}
        component={AdditionalInfoInputScreen}
        options={{ title: '情報入力' }}
      />
    </Stack.Navigator>
  );
}
