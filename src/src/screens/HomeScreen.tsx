import { useMemo, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { catRoutes, homeRoutes, mainTabs, recordRoutes } from '@/navigation/routes';
import { updateTaskStatus, useAppStore } from '@/store/useAppStore';
import { Cat, CatSchedule, HomeTask, RecordType, ReminderType } from '@/types/models';
import { daysUntil, formatJapaneseDate, toDateString } from '@/utils/date';

const UPCOMING_DAYS_RANGE = 7;

const taskTypeLabels: Record<ReminderType, string> = {
  vaccine: 'ワクチン',
  deworming: '駆虫',
  hospital_visit: '通院',
  medication: '投薬',
  birthday: '誕生日',
  adoption_anniversary: 'うちの子記念日',
  insurance_claim: '保険請求',
  weight_record: '体重',
  care: 'ケア',
};

const recordTypes: Array<{ label: string; type: RecordType }> = [
  { label: '体重', type: 'weight' },
  { label: '通院', type: 'hospital_visit' },
  { label: '投薬', type: 'medication' },
  { label: 'フード', type: 'food' },
  { label: '体調', type: 'health_condition' },
  { label: '保険', type: 'insurance' },
  { label: 'メモ', type: 'memo' },
];

const catSexLabels: Record<Cat['sex'], string> = {
  male: 'オス',
  female: 'メス',
  unknown: '性別不明',
};

type InfoSuggestion = {
  cat: Cat;
  missingLabels: string[];
};

function getCatName(cats: Cat[], catId: string) {
  return cats.find((cat) => cat.id === catId)?.name ?? '登録済みの猫';
}

function buildUpcomingPlans(schedules: CatSchedule[], today: string) {
  const todayDate = new Date(`${today}T00:00:00`);

  return schedules
    .filter((schedule) => schedule.status === 'scheduled')
    .map((schedule) => ({
      ...schedule,
      daysUntil: daysUntil(new Date(`${schedule.dueDate}T00:00:00`), todayDate),
    }))
    .filter((schedule) => schedule.daysUntil > 0 && schedule.daysUntil <= UPCOMING_DAYS_RANGE)
    .sort((left, right) => left.daysUntil - right.daysUntil);
}

function buildInfoSuggestions(
  cats: Cat[],
  medicalProfileCatIds: Set<string>,
  foodProfileCatIds: Set<string>,
  insuranceProfileCatIds: Set<string>,
  careProfileCatIds: Set<string>,
  dismissedIds: Set<string>,
): InfoSuggestion[] {
  return cats
    .map((cat) => {
      const missingLabels = [
        !medicalProfileCatIds.has(cat.id) ? '医療' : null,
        !foodProfileCatIds.has(cat.id) ? 'ごはん' : null,
        !insuranceProfileCatIds.has(cat.id) ? '保険' : null,
        !careProfileCatIds.has(cat.id) ? 'お世話' : null,
      ].filter((label): label is string => label !== null);

      return { cat, missingLabels };
    })
    .filter((suggestion) => suggestion.missingLabels.length > 0)
    .filter((suggestion) => !dismissedIds.has(suggestion.cat.id));
}

function calculateAge(cat: Cat) {
  if (!cat.birthDate) {
    return cat.birthDateType === 'estimated' ? '推定年齢未登録' : '年齢未登録';
  }

  const birthDate = new Date(`${cat.birthDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return cat.birthDateType === 'estimated' ? `推定${age}歳` : `${age}歳`;
}

function getTaskDateLabel(dueDate: string, today: string) {
  if (dueDate === today) {
    return '今日';
  }

  return dueDate < today ? `期限: ${dueDate}` : `予定日: ${dueDate}`;
}

export function HomeScreen() {
  const navigation = useNavigation();
  const cats = useAppStore((state) => state.cats);
  const tasks = useAppStore((state) => state.tasks);
  const schedules = useAppStore((state) => state.schedules);
  const medicalProfiles = useAppStore((state) => state.medicalProfiles);
  const foodProfiles = useAppStore((state) => state.foodProfiles);
  const insuranceProfiles = useAppStore((state) => state.insuranceProfiles);
  const careProfiles = useAppStore((state) => state.careProfiles);
  const homeStatus = useAppStore((state) => state.homeStatus);
  const homeErrorMessage = useAppStore((state) => state.homeErrorMessage);
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState(false);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<Set<string>>(new Set());
  const today = toDateString(new Date());

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status === 'pending')
        .filter((task) => task.dueDate <= today)
        .sort((left, right) => left.dueDate.localeCompare(right.dueDate)),
    [tasks, today],
  );

  const upcomingPlans = useMemo(() => buildUpcomingPlans(schedules, today), [schedules, today]);

  const infoSuggestions = useMemo(
    () =>
      buildInfoSuggestions(
        cats,
        new Set(medicalProfiles.map((profile) => profile.catId)),
        new Set(foodProfiles.map((profile) => profile.catId)),
        new Set(insuranceProfiles.map((profile) => profile.catId)),
        new Set(careProfiles.map((profile) => profile.catId)),
        dismissedSuggestionIds,
      ),
    [cats, careProfiles, dismissedSuggestionIds, foodProfiles, insuranceProfiles, medicalProfiles],
  );

  function navigateToCatDetail(catId: string) {
    navigation.dispatch(
      CommonActions.navigate(mainTabs.cats, {
        screen: catRoutes.detail,
        params: { catId },
      }),
    );
  }

  function openRecordInput(recordType?: RecordType, catId?: string) {
    setIsQuickRecordOpen(false);

    if (!catId) {
      navigation.dispatch(
        CommonActions.navigate(mainTabs.records, {
          screen: recordRoutes.catSelect,
          params: { recordType, source: 'home' },
        }),
      );
      return;
    }

    navigation.dispatch(
      CommonActions.navigate(homeRoutes.recordInput, { recordType, catId, source: 'home' }),
    );
  }

  if (homeStatus === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>読み込み中...</Text>
          <Text style={styles.stateText}>ホーム情報を準備しています。</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (homeStatus === 'error') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>ホーム情報を読み込めませんでした</Text>
          <Text style={styles.stateText}>
            {homeErrorMessage ?? '時間をおいてもう一度お試しください。'}
          </Text>
          <AppButton
            label="再読み込み"
            onPress={() => useAppStore.setState({ homeStatus: 'ready', homeErrorMessage: null })}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.container}>
          <HomeHeader />

          {cats.length === 0 ? (
            <EmptyCatsState
              onRegister={() =>
                navigation.dispatch(
                  CommonActions.navigate(mainTabs.cats, {
                    screen: catRoutes.create,
                  }),
                )
              }
            />
          ) : (
            <>
              <TodayTasksSection
                cats={cats}
                onAddRecord={() => setIsQuickRecordOpen(true)}
                onSnooze={(taskId) => updateTaskStatus(taskId, 'snoozed')}
                onComplete={(taskId) => updateTaskStatus(taskId, 'completed')}
                tasks={todayTasks}
                today={today}
              />

              <UpcomingPlansSection
                cats={cats}
                onPressPlan={(scheduleId) =>
                  navigation.dispatch(
                    CommonActions.navigate(homeRoutes.upcomingPlanDetail, { scheduleId }),
                  )
                }
                plans={upcomingPlans}
              />

              <CatMiniListSection
                cats={cats}
                onPressCat={navigateToCatDetail}
                schedules={schedules}
                tasks={tasks}
                today={today}
              />

              <InfoCompletionCard
                onDismiss={(catId) =>
                  setDismissedSuggestionIds((current) => new Set([...current, catId]))
                }
                onOpen={(catId) =>
                  navigation.dispatch(
                    CommonActions.navigate(homeRoutes.additionalInfoCategory, { catId }),
                  )
                }
                suggestion={infoSuggestions[0] ?? null}
              />
            </>
          )}
        </ScrollView>

        {cats.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsQuickRecordOpen(true)}
            style={({ pressed }) => [styles.fab, pressed ? styles.pressed : null]}
          >
            <Text style={styles.fabLabel}>+ 記録する</Text>
          </Pressable>
        ) : null}
      </View>

      <QuickRecordSheet
        isVisible={isQuickRecordOpen}
        onClose={() => setIsQuickRecordOpen(false)}
        onSelect={(recordType) => openRecordInput(recordType)}
      />
    </SafeAreaView>
  );
}

function HomeHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>今日のねこたち</Text>
        <Text style={styles.date}>{formatJapaneseDate(new Date())}</Text>
      </View>
      <View style={styles.headerActions}>
        <Text accessibilityLabel="通知" style={styles.headerIcon}>
          通知
        </Text>
        <Text
          accessibilityLabel="家族共有は近日公開"
          style={[styles.headerIcon, styles.disabledIcon]}
        >
          共有
        </Text>
      </View>
    </View>
  );
}

function EmptyCatsState({ onRegister }: { onRegister: () => void }) {
  return (
    <Card>
      <Text style={styles.sectionTitle}>最初の猫ちゃんを登録しましょう</Text>
      <Text style={styles.bodyText}>ねこれこは、猫ごとの情報をひとりずつ大切に記録できます。</Text>
      <View style={styles.sectionAction}>
        <AppButton label="猫ちゃんを登録する" onPress={onRegister} />
      </View>
    </Card>
  );
}

function TodayTasksSection({
  cats,
  tasks,
  onAddRecord,
  onComplete,
  onSnooze,
  today,
}: {
  cats: Cat[];
  tasks: HomeTask[];
  onAddRecord: () => void;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string) => void;
  today: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>今日やること</Text>
        <Text style={styles.sectionCount}>{tasks.length}件</Text>
      </View>

      {tasks.length === 0 ? (
        <Card>
          <Text style={styles.cardTitle}>今日の予定はありません</Text>
          <Text style={styles.bodyText}>みんな元気に過ごせますように。</Text>
          <View style={styles.sectionAction}>
            <AppButton label="記録を追加する" onPress={onAddRecord} />
          </View>
        </Card>
      ) : (
        <View style={styles.itemList}>
          {tasks.map((task) => (
            <Card key={task.id}>
              <View style={styles.taskCardHeader}>
                <Avatar name={getCatName(cats, task.catId)} />
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{getCatName(cats, task.catId)}</Text>
                  <Text style={styles.metaText}>
                    {taskTypeLabels[task.type]} / {getTaskDateLabel(task.dueDate, today)}
                  </Text>
                </View>
                <Text style={styles.badge}>{getTaskDateLabel(task.dueDate, today)}</Text>
              </View>
              <Text style={styles.bodyText}>{task.title}</Text>
              <View style={styles.rowActions}>
                <AppButton label="完了" onPress={() => onComplete(task.id)} />
                <AppButton label="あとで" onPress={() => onSnooze(task.id)} variant="secondary" />
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

function UpcomingPlansSection({
  cats,
  plans,
  onPressPlan,
}: {
  cats: Cat[];
  plans: Array<CatSchedule & { daysUntil: number }>;
  onPressPlan: (scheduleId: string) => void;
}) {
  if (plans.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>近日の予定</Text>
          <Text style={styles.sectionCount}>7日以内</Text>
        </View>
        <Card>
          <Text style={styles.cardTitle}>近日の予定はありません</Text>
          <Text style={styles.bodyText}>7日以内に対応が必要な予定はありません。</Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>近日の予定</Text>
        <Text style={styles.sectionCount}>7日以内</Text>
      </View>

      <View style={styles.itemList}>
        {plans.map((plan) => (
          <Pressable
            accessibilityRole="button"
            key={plan.id}
            onPress={() => onPressPlan(plan.id)}
            style={({ pressed }) => [styles.planRow, pressed ? styles.pressed : null]}
          >
            <Text style={styles.planDate}>{plan.daysUntil}日後</Text>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>
                {getCatName(cats, plan.catId)}: {plan.title}
              </Text>
              <Text style={styles.metaText}>{plan.dueDate}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function CatMiniListSection({
  cats,
  schedules,
  tasks,
  today,
  onPressCat,
}: {
  cats: Cat[];
  schedules: CatSchedule[];
  tasks: HomeTask[];
  today: string;
  onPressCat: (catId: string) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ねこ一覧</Text>
        <Text style={styles.sectionCount}>{cats.length}匹</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.catMiniRow}>
          {cats.map((cat) => {
            const pendingTaskCount = tasks.filter(
              (task) => task.catId === cat.id && task.status === 'pending',
            ).length;
            const nextPlan = buildUpcomingPlans(
              schedules.filter((schedule) => schedule.catId === cat.id),
              today,
            )[0];

            return (
              <Pressable
                accessibilityRole="button"
                key={cat.id}
                onPress={() => onPressCat(cat.id)}
                style={({ pressed }) => [styles.catMiniCard, pressed ? styles.pressed : null]}
              >
                <Avatar name={cat.name} size="large" />
                <Text style={styles.cardTitle}>{cat.name}</Text>
                <Text style={styles.metaText}>
                  {calculateAge(cat)} / {catSexLabels[cat.sex]}
                </Text>
                <Text style={styles.metaText}>{cat.coatColorPattern ?? '毛色・柄未登録'}</Text>
                <Text style={styles.metaText}>
                  {nextPlan ? `次: ${nextPlan.title} (${nextPlan.daysUntil}日後)` : '近日予定なし'}
                </Text>
                {pendingTaskCount > 0 ? (
                  <Text style={styles.warningText}>未完了 {pendingTaskCount}件</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCompletionCard({
  suggestion,
  onDismiss,
  onOpen,
}: {
  suggestion: InfoSuggestion | null;
  onDismiss: (catId: string) => void;
  onOpen: (catId: string) => void;
}) {
  if (!suggestion) {
    return null;
  }

  return (
    <Card>
      <Text style={styles.sectionTitle}>{suggestion.cat.name}の情報を追加しませんか？</Text>
      <Text style={styles.bodyText}>
        {suggestion.missingLabels.join('・')}を登録すると、予定や記録を確認しやすくなります。
      </Text>
      <View style={styles.rowActions}>
        <AppButton label="情報を追加する" onPress={() => onOpen(suggestion.cat.id)} />
        <AppButton
          label="あとで"
          onPress={() => onDismiss(suggestion.cat.id)}
          variant="secondary"
        />
      </View>
    </Card>
  );
}

function QuickRecordSheet({
  isVisible,
  onClose,
  onSelect,
}: {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (recordType: RecordType) => void;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={isVisible}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.sectionTitle}>何を記録しますか？</Text>
          <View style={styles.recordGrid}>
            {recordTypes.map((recordType) => (
              <Pressable
                accessibilityRole="button"
                key={recordType.type}
                onPress={() => onSelect(recordType.type)}
                style={({ pressed }) => [styles.recordChip, pressed ? styles.pressed : null]}
              >
                <Text style={styles.recordChipLabel}>{recordType.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.sectionAction}>
            <AppButton label="閉じる" onPress={onClose} variant="secondary" />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Avatar({ name, size = 'normal' }: { name: string; size?: 'normal' | 'large' }) {
  return (
    <View style={[styles.avatar, size === 'large' ? styles.avatarLarge : null]}>
      <Text style={styles.avatarText}>{name.slice(0, 1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
  },
  container: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: 112,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  headerIcon: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  disabledIcon: {
    color: colors.muted,
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
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  sectionCount: {
    color: colors.muted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  itemList: {
    gap: spacing.sm,
  },
  taskCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  bodyText: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  metaText: {
    color: colors.muted,
    fontSize: typography.caption,
    lineHeight: 20,
  },
  warningText: {
    color: colors.warning,
    fontSize: typography.caption,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  badge: {
    backgroundColor: '#f8eadf',
    borderRadius: radius.sm,
    color: colors.warning,
    fontSize: typography.caption,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionAction: {
    marginTop: spacing.md,
  },
  planRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  planDate: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '700',
    minWidth: 56,
  },
  catMiniRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  catMiniCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 172,
    padding: spacing.md,
    width: 172,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#eaf4f1',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarLarge: {
    borderRadius: 28,
    height: 56,
    width: 56,
  },
  avatarText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    bottom: spacing.lg,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
  },
  fabLabel: {
    color: colors.onPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(38, 48, 47, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    gap: spacing.md,
    padding: spacing.lg,
  },
  recordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recordChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '48%',
  },
  recordChipLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerState: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  stateTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateText: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 24,
    textAlign: 'center',
  },
});
