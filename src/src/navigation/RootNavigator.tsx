import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MainTabNavigator } from '@/navigation/MainTabNavigator';
import { OnboardingStack } from '@/navigation/stacks/OnboardingStack';
import { rootRoutes } from '@/navigation/routes';
import { RootStackParamList } from '@/navigation/types';
import { hydrateAppStore, useAppStore } from '@/store/useAppStore';
import { colors } from '@/constants/theme';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    void hydrateAppStore();
  }, []);

  if (!hasHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
