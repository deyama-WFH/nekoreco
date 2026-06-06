import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Screen, Section, Title } from '../components/ui';
import type { HomeStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { colors, theme } from '../theme';
import { ageLabel, formatDate, today } from '../utils/date';

type Props<Name extends keyof HomeStackParamList> = NativeStackScreenProps<HomeStackParamList, Name>;

const japaneseDate = () =>
  new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'full',
  }).format(new Date());

export function HomeScreen({ navigation }: Props<'Home'>) {
  const { cats, tasks, upcomingPlans, profiles, setTaskStatus } = useAppStore();
  const [hideSuggestion, setHideSuggestion] = useState(false);
  const plans = upcomingPlans.filter((plan) => plan.daysUntil > 0 && plan.daysUntil <= 7);
  const suggestionCat = cats.find((cat) => {
    const medical = profiles.medical.find((item) => item.catId === cat.id);
    const food = profiles.food.find((item) => item.catId === cat.id);
    return !medical?.nextVaccineDate || !medical.primaryHospitalName || !food?.regularFood;
  });

  return (
    <Screen>
      <Title subtitle={japaneseDate()}>今日のねこたち</Title>
      {cats.length === 0 ? (
        <EmptyState
          title="最初の猫ちゃんを登録しましょう"
          body="ねこレコは、猫ごとの情報をひとりずつ大切に記録できます。"
          action={
            <Button
              title="猫ちゃんを登録する"
              onPress={() =>
                navigation.getParent<any>()?.navigate('CatTab', { screen: 'CatCreate' })
              }
            />
          }
        />
      ) : (
        <>
          <Section title="今日やること">
            {tasks.length === 0 ? (
              <EmptyState
                title="今日の予定はありません"
                body="みんな元気に過ごせますように。"
                action={
                  <Button
                    title="記録を追加する"
                    variant="secondary"
                    onPress={() => navigation.navigate('HomeRecordTypeSelect', { source: 'home' })}
                  />
                }
              />
            ) : (
              tasks.map((task) => {
                const cat = cats.find((item) => item.id === task.catId);
                return (
                  <Pressable
                    key={task.id}
                    onPress={() => navigation.navigate('TodayTaskDetail', { taskId: task.id })}
                  >
                    <Card>
                      <View style={styles.row}>
                        <Image
                          source={require('../../assets/logo.PNG')}
                          style={styles.avatar}
                        />
                        <View style={styles.flex}>
                          <Text style={styles.cardTitle}>{cat?.name}</Text>
                          <Text style={styles.body}>{task.title}</Text>
                          {task.description ? (
                            <Text style={styles.muted}>{task.description}</Text>
                          ) : null}
                        </View>
                      </View>
                      <View style={styles.actions}>
                        <Button title="完了" onPress={() => setTaskStatus(task.id, 'completed')} />
                        <Button
                          title="あとで"
                          variant="secondary"
                          onPress={() => setTaskStatus(task.id, 'snoozed')}
                        />
                      </View>
                    </Card>
                  </Pressable>
                );
              })
            )}
          </Section>
          {plans.length ? (
            <Section title="近日の予定">
              {plans.map((plan) => (
                <Pressable
                  key={plan.id}
                  onPress={() => navigation.navigate('UpcomingPlanDetail', { planId: plan.id })}
                >
                  <Card>
                    <Text style={styles.badge}>{plan.daysUntil}日後</Text>
                    <Text style={styles.cardTitle}>
                      {plan.catName}：{plan.title}
                    </Text>
                    <Text style={styles.muted}>{formatDate(plan.scheduledDate)}</Text>
                  </Card>
                </Pressable>
              ))}
            </Section>
          ) : null}
          <Section title="ねこ一覧">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.horizontal}>
                {cats.map((cat) => {
                  const plan = upcomingPlans.find((item) => item.catId === cat.id);
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() =>
                        navigation
                          .getParent<any>()
                          ?.navigate('CatTab', { screen: 'CatDetail', params: { catId: cat.id } })
                      }
                      style={styles.miniCard}
                    >
                      <Image source={require('../../assets/logo.PNG')} style={styles.miniPhoto} />
                      <Text style={styles.cardTitle}>{cat.name}</Text>
                      <Text style={styles.muted}>{ageLabel(cat.birthDate, cat.birthDateType)}</Text>
                      <Text style={styles.next}>
                        {plan ? `${plan.title}：${plan.daysUntil}日後` : '次の予定なし'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Section>
          {suggestionCat && !hideSuggestion ? (
            <Card style={styles.suggestion}>
              <Text style={styles.cardTitle}>{suggestionCat.name}ちゃんの情報を追加しませんか？</Text>
              <Text style={styles.body}>
                ワクチン・保険・フードを登録すると、通知や管理がもっと便利になります。
              </Text>
              <Button
                title="情報を追加する"
                onPress={() =>
                  navigation.navigate('HomeAdditionalInfoCategory', {
                    catId: suggestionCat.id,
                    source: 'home',
                  })
                }
              />
              <Button title="あとで" variant="ghost" onPress={() => setHideSuggestion(true)} />
            </Card>
          ) : null}
        </>
      )}
      {cats.length ? (
        <Button
          title="＋ 記録する"
          onPress={() => navigation.navigate('HomeRecordTypeSelect', { source: 'home' })}
        />
      ) : null}
    </Screen>
  );
}

export function TodayTaskDetailScreen({ navigation, route }: Props<'TodayTaskDetail'>) {
  const { tasks, cats, setTaskStatus } = useAppStore();
  const task = tasks.find((item) => item.id === route.params.taskId);
  const cat = cats.find((item) => item.id === task?.catId);
  return (
    <Screen>
      <Title subtitle={cat?.name}>{task?.title ?? 'タスクが見つかりません'}</Title>
      {task ? (
        <Card>
          <Text style={styles.body}>予定日：{formatDate(task.dueDate)}</Text>
          <Text style={styles.body}>{task.description}</Text>
          <Button
            title="完了"
            onPress={() => {
              setTaskStatus(task.id, 'completed');
              navigation.goBack();
            }}
          />
        </Card>
      ) : null}
    </Screen>
  );
}

export function UpcomingPlanDetailScreen({ route }: Props<'UpcomingPlanDetail'>) {
  const { upcomingPlans } = useAppStore();
  const plan = upcomingPlans.find((item) => item.id === route.params.planId);
  return (
    <Screen>
      <Title subtitle={plan?.catName}>{plan?.title ?? '予定が見つかりません'}</Title>
      {plan ? (
        <Card>
          <Text style={styles.body}>予定日：{formatDate(plan.scheduledDate)}</Text>
          <Text style={styles.body}>あと{plan.daysUntil}日</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

export function HomeAdditionalInfoCategoryScreen({
  navigation,
  route,
}: Props<'HomeAdditionalInfoCategory'>) {
  const categories = [
    ['medical_prevention', '医療・予防'],
    ['hospital_insurance', '病院・保険'],
    ['food', 'ごはん'],
    ['care_notes', 'お世話・注意事項'],
  ] as const;
  return (
    <Screen>
      <Title subtitle="必要な項目だけ、あとから追加できます。">詳しい情報を追加しましょう</Title>
      {categories.map(([categoryId, label]) => (
        <Button
          key={categoryId}
          title={label}
          variant="secondary"
          onPress={() =>
            navigation.navigate('HomeAdditionalInfoInput', {
              catId: route.params.catId,
              categoryId,
            })
          }
        />
      ))}
    </Screen>
  );
}

export function HomeAdditionalInfoInputScreen({ navigation, route }: Props<'HomeAdditionalInfoInput'>) {
  return (
    <Screen>
      <Title subtitle="猫詳細の編集画面からプロフィール情報を更新できます。">情報を追加</Title>
      <Button
        title="プロフィール編集へ"
        onPress={() =>
          navigation
            .getParent<any>()
            ?.navigate('CatTab', {
              screen: 'CatProfileEdit',
              params: { catId: route.params.catId },
            })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  flex: { flex: 1 },
  avatar: { height: 56, resizeMode: 'contain', width: 56 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  body: { color: colors.text, lineHeight: 21 },
  muted: { color: colors.muted, fontSize: 13 },
  actions: { flexDirection: 'row', gap: theme.spacing.sm },
  badge: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  horizontal: { flexDirection: 'row', gap: theme.spacing.sm },
  miniCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    width: 160,
  },
  miniPhoto: { alignSelf: 'center', height: 72, resizeMode: 'contain', width: 72 },
  next: { color: colors.primaryDark, fontSize: 12, marginTop: 8 },
  suggestion: { backgroundColor: '#FFF3D8' },
});
