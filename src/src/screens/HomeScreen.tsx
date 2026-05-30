import { CommonActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { colors, spacing, typography } from '@/constants/theme';
import { catRoutes, homeRoutes } from '@/navigation/routes';
import { useAppStore } from '@/store/useAppStore';
import { formatJapaneseDate } from '@/utils/date';

export function HomeScreen() {
  const navigation = useNavigation();
  const cats = useAppStore((state) => state.cats);
  const tasks = useAppStore((state) => state.tasks);
  const schedules = useAppStore((state) => state.schedules);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>今日のねこたち</Text>
          <Text style={styles.date}>{formatJapaneseDate(new Date())}</Text>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>今日やること</Text>
          {tasks.map((task) => (
            <Text key={task.id} style={styles.item}>
              {task.title}
            </Text>
          ))}
          <AppButton
            label="タスク詳細へ"
            onPress={() => navigation.dispatch(CommonActions.navigate(homeRoutes.todayTaskDetail))}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>近日の予定</Text>
          {schedules.map((schedule) => (
            <Text key={schedule.id} style={styles.item}>
              {schedule.title}: {schedule.dueDate}
            </Text>
          ))}
          <AppButton
            label="予定詳細へ"
            variant="secondary"
            onPress={() =>
              navigation.dispatch(CommonActions.navigate(homeRoutes.upcomingPlanDetail))
            }
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>ねこ一覧ミニ表示</Text>
          {cats.map((cat) => (
            <Text key={cat.id} style={styles.item}>
              {cat.name} / {cat.coatColorPattern ?? '毛色未登録'}
            </Text>
          ))}
          <AppButton
            label="猫詳細へ"
            variant="secondary"
            onPress={() => navigation.dispatch(CommonActions.navigate(catRoutes.detail))}
          />
        </Card>

        <AppButton
          label="記録する"
          onPress={() => navigation.dispatch(CommonActions.navigate(homeRoutes.recordInput))}
        />
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
  date: {
    color: colors.muted,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  item: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
});
