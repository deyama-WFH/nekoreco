import { CommonActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { colors, spacing, typography } from '@/constants/theme';
import { settingsRoutes } from '@/navigation/routes';
import { useAppStore } from '@/store/useAppStore';

export function SettingsScreen() {
  const navigation = useNavigation();
  const reminderSettings = useAppStore((state) => state.reminderSettings);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>設定</Text>

        <Card>
          <Text style={styles.sectionTitle}>通知設定</Text>
          <Text style={styles.description}>設定済みカテゴリ: {reminderSettings.length}件</Text>
          <AppButton
            label="通知設定へ"
            onPress={() => navigation.dispatch(CommonActions.navigate(settingsRoutes.reminders))}
          />
        </Card>

        <View style={styles.actions}>
          <AppButton
            label="通知許可"
            variant="secondary"
            onPress={() =>
              navigation.dispatch(CommonActions.navigate(settingsRoutes.notificationPermission))
            }
          />
          <AppButton
            label="家族共有"
            variant="secondary"
            onPress={() =>
              navigation.dispatch(CommonActions.navigate(settingsRoutes.familyShareComingSoon))
            }
          />
          <AppButton
            label="アプリ情報"
            variant="secondary"
            onPress={() => navigation.dispatch(CommonActions.navigate(settingsRoutes.appInfo))}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
});
