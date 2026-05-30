import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabNavigator } from '@/navigation/MainTabNavigator';
import { OnboardingStack } from '@/navigation/stacks/OnboardingStack';
import { rootRoutes } from '@/navigation/routes';
import { RootStackParamList } from '@/navigation/types';
import { useAppStore } from '@/store/useAppStore';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {hasCompletedOnboarding ? (
          <RootStack.Screen name={rootRoutes.mainTabs} component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name={rootRoutes.onboarding} component={OnboardingStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
