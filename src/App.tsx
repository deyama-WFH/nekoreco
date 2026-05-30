import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from './src/components/AppButton';
import { Card } from './src/components/Card';
import { colors, spacing, typography } from './src/constants/theme';
import { mockCats } from './src/store/mockData';
import { useAppStore } from './src/store/useAppStore';
import { formatJapaneseDate } from './src/utils/date';

export default function App() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const firstCat = mockCats[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>ねこレコ</Text>
          <Text style={styles.subtitle}>猫ごとの情報を記録し、次にやることを忘れない。</Text>
        </View>

        <Card>
          <Text style={styles.sectionLabel}>Phase 0</Text>
          <Text style={styles.title}>iOS / Android 共通アプリ基盤</Text>
          <Text style={styles.body}>
            Expo、TypeScript、Lint、Formatter、テスト、テーマ、共通 UI、簡易ストアを配置しました。
            後続フェーズでオンボーディング、ホーム、猫一覧、記録、通知をこの土台に追加します。
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionLabel}>起動判定</Text>
          <Text style={styles.body}>
            現在は {hasCompletedOnboarding ? 'メインタブ表示' : 'オンボーディング表示'} の状態です。
          </Text>
        </Card>

        {firstCat ? (
          <Card>
            <Text style={styles.sectionLabel}>仮データ</Text>
            <Text style={styles.title}>{firstCat.name}</Text>
            <Text style={styles.body}>
              {firstCat.sex === 'male' ? 'オス' : firstCat.sex === 'female' ? 'メス' : '不明'} /{' '}
              {firstCat.coatColorPattern ?? '毛色未登録'}
            </Text>
            <Text style={styles.caption}>今日: {formatJapaneseDate(new Date())}</Text>
          </Card>
        ) : null}

        <View style={styles.actions}>
          <AppButton label="オンボーディング完了にする" onPress={() => useAppStore.setState({ hasCompletedOnboarding: true })} />
          <AppButton
            label="初回状態に戻す"
            variant="secondary"
            onPress={() => useAppStore.setState({ hasCompletedOnboarding: false })}
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
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  brand: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
  },
  sectionLabel: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
  },
  caption: {
    color: colors.muted,
    fontSize: typography.caption,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
