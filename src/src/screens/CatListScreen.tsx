import { CommonActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { colors, spacing, typography } from '@/constants/theme';
import { catRoutes } from '@/navigation/routes';
import { useAppStore } from '@/store/useAppStore';

export function CatListScreen() {
  const navigation = useNavigation();
  const cats = useAppStore((state) => state.cats);
  const tasks = useAppStore((state) => state.tasks);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ねこ一覧</Text>
            <Text style={styles.count}>{cats.length}匹のねこ</Text>
          </View>
          <AppButton
            label="追加"
            variant="secondary"
            onPress={() => navigation.dispatch(CommonActions.navigate(catRoutes.create))}
          />
        </View>

        <Text style={styles.searchLabel}>名前で検索</Text>

        <View style={styles.grid}>
          {cats.map((cat) => {
            const taskCount = tasks.filter(
              (task) => task.catId === cat.id && task.status === 'pending',
            ).length;

            return (
              <Card key={cat.id}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catMeta}>
                  {cat.sex === 'male' ? 'オス' : cat.sex === 'female' ? 'メス' : '不明'} /{' '}
                  {cat.coatColorPattern ?? '毛色未登録'}
                </Text>
                <Text style={styles.catMeta}>未完了: {taskCount}件</Text>
                <AppButton
                  label="詳細"
                  onPress={() => navigation.dispatch(CommonActions.navigate(catRoutes.detail))}
                />
              </Card>
            );
          })}
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '700',
  },
  count: {
    color: colors.muted,
    fontSize: typography.body,
  },
  searchLabel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.muted,
    fontSize: typography.body,
    padding: spacing.md,
  },
  grid: {
    gap: spacing.md,
  },
  catName: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  catMeta: {
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.xs,
  },
});
