import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStoreProvider } from './src/store/AppStore';
import { theme } from './src/theme';

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
