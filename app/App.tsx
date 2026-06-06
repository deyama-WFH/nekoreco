import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStoreProvider } from './src/store/AppStore';
import { theme } from './src/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <NavigationContainer theme={theme.navigation}>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
