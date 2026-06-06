import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Button, Card, Screen, Title } from '../components/ui';
import type { SettingsStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { colors, theme } from '../theme';
import type { ReminderType } from '../types/models';

type Props<Name extends keyof SettingsStackParamList> = NativeStackScreenProps<
  SettingsStackParamList,
  Name
>;

export function SettingsScreen({ navigation }: Props<'Settings'>) {
  const items = [
    ['通知設定', () => navigation.navigate('ReminderSettings')],
    [
      '家族共有',
      () => navigation.navigate('SettingsFamilyShareComingSoon', { source: 'settings' }),
    ],
    ['アプリ情報', () => navigation.navigate('AppInfo')],
  ] as const;
  return (
    <Screen>
      <Title subtitle="通知やアプリの情報を管理します。">設定</Title>
      {items.map(([label, onPress]) => (
        <Pressable key={label} onPress={onPress}>
          <Card>
            <View style={styles.row}>
              <Text style={styles.item}>{label}</Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const labels: Record<ReminderType, string> = {
  vaccine: 'ワクチン',
  deworming: '駆虫薬',
  hospital_visit: '通院予定',
  medication: '投薬',
  birthday: '誕生日',
  adoption_anniversary: 'うちの子記念日',
  insurance_claim: '保険請求',
  weight_record: '体重記録',
  care: 'ケア',
};

const timingLabels = {
  seven_days_before: '7日前',
  three_days_before: '3日前',
  one_day_before: '前日',
  on_the_day: '当日',
  custom: 'カスタム',
};

export function ReminderSettingsScreen({ navigation }: Props<'ReminderSettings'>) {
  const {
    reminderGlobal,
    reminderCategories,
    reminders,
    setReminderGlobal,
    setReminderCategory,
  } = useAppStore();
  return (
    <Screen>
      <Title subtitle={`生成済みの通知予定：${reminders.length}件`}>通知設定</Title>
      <Card>
        <View style={styles.row}>
          <Text style={styles.item}>通知を受け取る</Text>
          <Switch
            value={reminderGlobal.enabled}
            onValueChange={(enabled) => setReminderGlobal({ enabled })}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <Text style={styles.note}>通知時刻：{reminderGlobal.defaultNotificationTime}</Text>
      </Card>
      {reminderCategories
        .filter((item) => !['weight_record', 'care'].includes(item.reminderType))
        .map((setting) => (
          <Card key={setting.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.item}>{labels[setting.reminderType]}</Text>
                <Text style={styles.note}>
                  {setting.timings.map((timing) => timingLabels[timing]).join('・')}
                </Text>
              </View>
              <Switch
                value={setting.enabled}
                disabled={!reminderGlobal.enabled}
                onValueChange={(enabled) => setReminderCategory(setting.reminderType, enabled)}
                trackColor={{ true: colors.primary }}
              />
            </View>
          </Card>
        ))}
      <Button
        title="通知の許可を確認する"
        variant="secondary"
        onPress={() => navigation.navigate('NotificationPermission')}
      />
    </Screen>
  );
}

export function NotificationPermissionScreen({ navigation }: Props<'NotificationPermission'>) {
  const [requesting, setRequesting] = useState(false);
  const request = async () => {
    setRequesting(true);
    try {
      const permission = await Notifications.requestPermissionsAsync();
      Alert.alert(
        permission.granted ? '通知を許可しました' : '通知は許可されていません',
        permission.granted
          ? 'ワクチン・通院・記念日などを事前にお知らせできます。'
          : '端末の設定からいつでも変更できます。',
      );
      if (permission.granted) navigation.goBack();
    } finally {
      setRequesting(false);
    }
  };
  return (
    <Screen contentStyle={styles.center}>
      <Title subtitle="ワクチン・通院・記念日などを事前にお知らせします。">
        予定を忘れないように通知を受け取りますか？
      </Title>
      <Button
        title={requesting ? '確認中...' : '通知を許可する'}
        disabled={requesting}
        onPress={() => void request()}
      />
      <Button title="あとで" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

export function FamilyShareComingSoonScreen({ navigation }: any) {
  return (
    <Screen contentStyle={styles.center}>
      <Title subtitle="猫ちゃんのお世話メモ、通院予定、投薬、保険請求状況などを家族で共有できる機能を準備しています。">
        家族共有は近日公開予定です
      </Title>
      <Button title="閉じる" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

export function AppInfoScreen() {
  return (
    <Screen>
      <Title subtitle="猫ごとの情報を記録し、次にやることを忘れない。">ねこレコ</Title>
      <Card>
        <Text style={styles.item}>バージョン 1.0.0 MVP</Text>
        <Text style={styles.note}>データはこの端末内に保存されます。</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  item: { color: colors.text, fontSize: 16, fontWeight: '700' },
  arrow: { color: colors.muted, fontSize: 26 },
  note: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  flex: { flex: 1 },
  center: { justifyContent: 'center' },
});
