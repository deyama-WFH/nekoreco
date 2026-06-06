import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Field, Screen, Title } from '../components/ui';
import type { CatDetailTab, CatStackParamList } from '../navigation/types';
import { useAppStore } from '../store/AppStore';
import { colors, theme } from '../theme';
import type { CatRecord, RecordType } from '../types/models';
import { ageLabel, formatDate } from '../utils/date';
import { CatProfileForm } from './OnboardingScreens';

type Props<Name extends keyof CatStackParamList> = NativeStackScreenProps<CatStackParamList, Name>;

const sexLabels = { male: 'オス', female: 'メス', unknown: '不明' };
const tabLabels: Array<{ id: CatDetailTab; label: string }> = [
  { id: 'overview', label: '概要' },
  { id: 'medical', label: '医療' },
  { id: 'food', label: 'ごはん' },
  { id: 'timeline', label: '履歴' },
  { id: 'insurance', label: '保険' },
  { id: 'memo', label: 'メモ' },
];

export function CatListScreen({ navigation }: Props<'CatList'>) {
  const { cats, tasks, upcomingPlans } = useAppStore();
  const [query, setQuery] = useState('');
  const filtered = cats.filter((cat) => cat.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Screen>
      <View style={styles.header}>
        <Title subtitle={`${cats.length}匹のねこ`}>ねこ一覧</Title>
        <Button title="＋ 追加" onPress={() => navigation.navigate('CatCreate')} />
      </View>
      <Field label="検索" placeholder="名前で検索" value={query} onChangeText={setQuery} />
      {cats.length === 0 ? (
        <EmptyState
          title="猫ちゃんを登録しましょう"
          body="ねこレコは、猫ごとの情報をひとりずつ大切に記録できます。"
          action={<Button title="猫ちゃんを追加する" onPress={() => navigation.navigate('CatCreate')} />}
        />
      ) : (
        <View style={styles.grid}>
          {filtered.map((cat) => {
            const plan = upcomingPlans.find((item) => item.catId === cat.id);
            const pendingCount = tasks.filter((item) => item.catId === cat.id).length;
            return (
              <Pressable
                key={cat.id}
                style={styles.catCard}
                onPress={() => navigation.navigate('CatDetail', { catId: cat.id })}
              >
                <Image source={require('../../assets/logo.png')} style={styles.catPhoto} />
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.meta}>
                  {ageLabel(cat.birthDate, cat.birthDateType)} / {sexLabels[cat.sex]}
                </Text>
                <Text style={styles.meta}>{cat.coatColorPattern || '毛色・柄 未登録'}</Text>
                <Text style={styles.next}>
                  {plan ? `${plan.title}：${plan.daysUntil}日後` : '次の予定なし'}
                </Text>
                {pendingCount ? <Text style={styles.warning}>未完了：{pendingCount}件</Text> : null}
              </Pressable>
            );
          })}
        </View>
      )}
      {cats.length > 0 && filtered.length === 0 ? (
        <EmptyState title="該当する猫がいません" body="検索する名前を変えてください。" />
      ) : null}
    </Screen>
  );
}

export function CatCreateScreen({ navigation }: Props<'CatCreate'>) {
  const { addCat } = useAppStore();
  return (
    <Screen>
      <Title subtitle="あとから変更できます。わかる範囲で入力してください。">
        猫ちゃんを追加
      </Title>
      <CatProfileForm
        submitLabel="追加する"
        onSubmit={(value) => {
          const catId = addCat({
            name: value.name,
            sex: value.sex,
            birthDate: value.birthDate || null,
            birthDateType: value.birthDateType,
            adoptionDate: value.adoptionDate || null,
            adoptionDateType: value.adoptionDateType,
            breed: value.breedType === 'mixed' ? '雑種' : value.breed || null,
            breedType: value.breedType,
            coatColorPattern: value.coatColorPattern || null,
            photoUrl: null,
          });
          navigation.replace('CatDetail', { catId });
        }}
      />
    </Screen>
  );
}

export function CatProfileEditScreen({ navigation, route }: Props<'CatProfileEdit'>) {
  const { cats, updateCat } = useAppStore();
  const cat = cats.find((item) => item.id === route.params.catId);
  if (!cat) return <EmptyState title="猫が見つかりません" body="一覧から選び直してください。" />;
  return (
    <Screen>
      <Title>{cat.name}のプロフィール編集</Title>
      <CatProfileForm
        initial={{
          name: cat.name,
          sex: cat.sex,
          birthDate: cat.birthDate ?? '',
          birthDateType: cat.birthDateType,
          adoptionDate: cat.adoptionDate ?? '',
          adoptionDateType: cat.adoptionDateType,
          breed: cat.breed ?? '',
          breedType: cat.breedType,
          coatColorPattern: cat.coatColorPattern ?? '',
        }}
        submitLabel="保存する"
        onSubmit={(value) => {
          updateCat(cat.id, {
            ...value,
            birthDate: value.birthDate || null,
            adoptionDate: value.adoptionDate || null,
            breed: value.breedType === 'mixed' ? '雑種' : value.breed || null,
          });
          navigation.goBack();
        }}
      />
    </Screen>
  );
}

export function CatDetailScreen({ navigation, route }: Props<'CatDetail'>) {
  const { cats, profiles, records, upcomingPlans } = useAppStore();
  const [tab, setTab] = useState<CatDetailTab>(route.params.initialTab ?? 'overview');
  const cat = cats.find((item) => item.id === route.params.catId);
  const catRecords = useMemo(
    () =>
      records
        .filter((record) => record.catId === route.params.catId)
        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [records, route.params.catId],
  );
  if (!cat) {
    return (
      <Screen>
        <EmptyState title="猫が見つかりません" body="一覧から選び直してください。" />
      </Screen>
    );
  }
  const medical = profiles.medical.find((item) => item.catId === cat.id);
  const food = profiles.food.find((item) => item.catId === cat.id);
  const insurance = profiles.insurance.find((item) => item.catId === cat.id);
  const care = profiles.care.find((item) => item.catId === cat.id);
  const nextPlan = upcomingPlans.find((item) => item.catId === cat.id);
  const quickRecord = (recordType: RecordType) =>
    navigation.navigate('CatRecordInput', {
      source: 'cat_detail',
      catId: cat.id,
      recordType,
    });
  return (
    <Screen>
      <Card>
        <View style={styles.profile}>
          <Image source={require('../../assets/logo.png')} style={styles.detailPhoto} />
          <View style={styles.flex}>
            <Text style={styles.detailName}>{cat.name}</Text>
            <Text style={styles.meta}>
              {ageLabel(cat.birthDate, cat.birthDateType)} / {sexLabels[cat.sex]}
            </Text>
            <Text style={styles.meta}>{cat.coatColorPattern || '毛色・柄 未登録'}</Text>
            <Text style={styles.meta}>うちの子記念日：{formatDate(cat.adoptionDate)}</Text>
            <Text style={styles.next}>
              {nextPlan ? `${nextPlan.title}：${nextPlan.daysUntil}日後` : '次の予定なし'}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Button title="編集" variant="secondary" onPress={() => navigation.navigate('CatProfileEdit', { catId: cat.id })} />
          <Button
            title="共有"
            variant="secondary"
            onPress={() =>
              navigation.navigate('FamilyShareComingSoon', {
                catId: cat.id,
                source: 'cat_detail',
              })
            }
          />
        </View>
      </Card>
      <View style={styles.tabs}>
        {tabLabels.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.tab, tab === item.id && styles.tabActive]}
            onPress={() => setTab(item.id)}
          >
            <Text style={tab === item.id ? styles.tabTextActive : styles.tabText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <TabContent
        tab={tab}
        cat={cat}
        medical={medical}
        food={food}
        insurance={insurance}
        care={care}
        records={catRecords}
        quickRecord={quickRecord}
      />
      <Button
        title="＋ この子の記録を追加"
        onPress={() =>
          navigation.navigate('CatRecordTypeSelect', { source: 'cat_detail', catId: cat.id })
        }
      />
    </Screen>
  );
}

function TabContent({
  tab,
  cat,
  medical,
  food,
  insurance,
  care,
  records,
  quickRecord,
}: {
  tab: CatDetailTab;
  cat: ReturnType<typeof useAppStore>['cats'][number];
  medical?: ReturnType<typeof useAppStore>['profiles']['medical'][number];
  food?: ReturnType<typeof useAppStore>['profiles']['food'][number];
  insurance?: ReturnType<typeof useAppStore>['profiles']['insurance'][number];
  care?: ReturnType<typeof useAppStore>['profiles']['care'][number];
  records: CatRecord[];
  quickRecord: (type: RecordType) => void;
}) {
  if (tab === 'overview') {
    return (
      <Card>
        <Info label="猫種" value={cat.breed} />
        <Info label="性格" value={care?.personality} />
        <Info label="注意事項" value={care?.careNotes} />
        <Info label="家族への申し送り" value={care?.familyNote} />
        <Info label="主治医" value={medical?.primaryDoctorName} />
        <View style={styles.quickGrid}>
          {[
            ['体重を記録', 'weight'],
            ['通院を記録', 'hospital_visit'],
            ['フードを記録', 'food'],
            ['メモを追加', 'memo'],
          ].map(([label, type]) => (
            <Button
              key={type}
              title={label!}
              variant="secondary"
              onPress={() => quickRecord(type as RecordType)}
            />
          ))}
        </View>
      </Card>
    );
  }
  if (tab === 'medical') {
    const medicalRecords = records.filter((record) =>
      ['hospital_visit', 'vaccine', 'deworming', 'medication'].includes(record.recordType),
    );
    return (
      <Card>
        <Info label="次回ワクチン" value={formatDate(medical?.nextVaccineDate)} />
        <Info label="次回駆虫薬" value={formatDate(medical?.nextDewormingDate)} />
        <Info label="通院予定" value={formatDate(medical?.nextHospitalVisitDate)} />
        <Info label="病歴" value={medical?.medicalHistory} />
        <Info label="投薬" value={care?.medicationNote} />
        <Text style={styles.sectionLabel}>医療記録 {medicalRecords.length}件</Text>
        <Button title="通院を追加" variant="secondary" onPress={() => quickRecord('hospital_visit')} />
        <Button title="投薬を追加" variant="secondary" onPress={() => quickRecord('medication')} />
      </Card>
    );
  }
  if (tab === 'food') {
    const foodRecords = records.filter(
      (record): record is Extract<CatRecord, { recordType: 'food' }> => record.recordType === 'food',
    );
    return (
      <Card>
        <Info label="いつものフード" value={food?.regularFood} />
        <Info label="好きなごはん" value={food?.favoriteFood} />
        <Info label="苦手なごはん" value={food?.dislikedFood} />
        <Info label="アレルギー" value={food?.foodAllergies} />
        {foodRecords.map((record) => (
          <Info key={record.id} label={record.foodName} value={record.foodStatus} />
        ))}
        <Button title="フードを追加" variant="secondary" onPress={() => quickRecord('food')} />
      </Card>
    );
  }
  if (tab === 'timeline') {
    return (
      <Card>
        {records.length ? records.map((record) => <RecordLine key={record.id} record={record} />) : <Text style={styles.meta}>記録はまだありません</Text>}
      </Card>
    );
  }
  if (tab === 'insurance') {
    const claims = records.filter(
      (record): record is Extract<CatRecord, { recordType: 'insurance' }> =>
        record.recordType === 'insurance',
    );
    return (
      <Card>
        <Info label="加入保険" value={insurance?.insuranceName} />
        <Info label="保険プラン" value={insurance?.insurancePlan} />
        <Info label="証券番号" value={insurance?.insurancePolicyNumber} />
        {claims.map((record) => (
          <Info
            key={record.id}
            label={record.hospitalName || '保険請求'}
            value={`${record.claimStatus}${record.amount ? ` / ${record.amount}円` : ''}`}
          />
        ))}
        <Button title="請求を追加" variant="secondary" onPress={() => quickRecord('insurance')} />
      </Card>
    );
  }
  const memos = records.filter(
    (record): record is Extract<CatRecord, { recordType: 'memo' }> => record.recordType === 'memo',
  );
  return (
    <Card>
      <Info label="性格" value={care?.personality} />
      <Info label="留守中の注意" value={care?.awayCareNote} />
      <Info label="家族への申し送り" value={care?.familyNote} />
      {memos.map((record) => (
        <Info key={record.id} label={record.title || record.memoCategory} value={record.body} />
      ))}
      <Button title="メモを追加" variant="secondary" onPress={() => quickRecord('memo')} />
    </Card>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '未登録'}</Text>
    </View>
  );
}

function RecordLine({ record }: { record: CatRecord }) {
  let summary = record.note || '';
  if (record.recordType === 'weight') summary = `${record.weightKg}kg`;
  if (record.recordType === 'hospital_visit') summary = record.visitNote || record.hospitalName || '通院';
  if (record.recordType === 'food') summary = `${record.foodName} / ${record.foodStatus}`;
  if (record.recordType === 'memo') summary = record.body;
  return (
    <View style={styles.timeline}>
      <Text style={styles.infoLabel}>{formatDate(record.recordedAt.slice(0, 10))}</Text>
      <Text style={styles.cardTitle}>{recordTypeLabel(record.recordType)}</Text>
      <Text style={styles.meta}>{summary}</Text>
    </View>
  );
}

const recordTypeLabel = (type: RecordType) =>
  ({
    weight: '体重',
    hospital_visit: '通院',
    vaccine: 'ワクチン',
    deworming: '駆虫薬',
    medication: '投薬',
    food: 'フード',
    health_condition: '体調',
    care: 'ケア',
    insurance: '保険',
    memo: 'メモ',
  })[type];

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  catCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: 12,
    width: '48%',
  },
  catPhoto: { alignSelf: 'center', height: 88, resizeMode: 'contain', width: 88 },
  catName: { color: colors.text, fontSize: 18, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  next: { color: colors.primaryDark, fontSize: 12, marginTop: 8 },
  warning: { color: colors.warning, fontSize: 12, fontWeight: '700', marginTop: 4 },
  profile: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  detailPhoto: { height: 104, resizeMode: 'contain', width: 104 },
  detailName: { color: colors.text, fontSize: 25, fontWeight: '800' },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: theme.spacing.sm },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tab: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: { backgroundColor: colors.tint, borderColor: colors.primary },
  tabText: { color: colors.muted },
  tabTextActive: { color: colors.primaryDark, fontWeight: '700' },
  info: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 8 },
  infoLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  infoValue: { color: colors.text, fontSize: 15, marginTop: 3 },
  quickGrid: { gap: theme.spacing.sm, marginTop: 8 },
  sectionLabel: { color: colors.text, fontWeight: '700', marginTop: 8 },
  timeline: { borderLeftColor: colors.primary, borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 8 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
