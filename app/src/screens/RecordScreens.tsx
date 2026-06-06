import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, ChoiceRow, Field, Screen, Title } from '../components/ui';
import { useAppStore } from '../store/AppStore';
import { colors, theme } from '../theme';
import type {
  CatRecord,
  ConditionStatus,
  FoodStatus,
  HealthCategory,
  InsuranceClaimStatus,
  MedicationTiming,
  MemoCategory,
  RecordType,
} from '../types/models';
import { addDays, ageLabel, today } from '../utils/date';

const recordTypes: Array<{ type: RecordType; label: string; description: string }> = [
  { type: 'weight', label: '体重', description: '測った体重をすばやく保存' },
  { type: 'hospital_visit', label: '通院', description: '診察内容と次回予定' },
  { type: 'medication', label: '投薬', description: '薬名、量、投薬済み' },
  { type: 'food', label: 'フード', description: '食べたごはんと反応' },
  { type: 'health_condition', label: '体調', description: '日常の小さな変化' },
  { type: 'insurance', label: '保険', description: '請求状況と金額' },
  { type: 'memo', label: 'メモ', description: '自由な記録' },
];

export function RecordTypeSelectScreen({ navigation, route }: any) {
  const source = route.params?.source ?? 'record_tab';
  const catId = route.params?.catId;
  return (
    <Screen>
      <Title subtitle="記録したい内容を選んでください。">何を記録しますか？</Title>
      {recordTypes.map((item) => (
        <Pressable
          key={item.type}
          onPress={() => {
            if (source === 'cat_detail' && catId) {
              navigation.navigate('CatRecordInput', { source, catId, recordType: item.type });
            } else if (source === 'home') {
              navigation.navigate('HomeRecordCatSelect', { source, recordType: item.type });
            } else {
              navigation.navigate('RecordCatSelect', {
                source: 'record_tab',
                recordType: item.type,
              });
            }
          }}
        >
          <Card>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <Text style={styles.muted}>{item.description}</Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

export function RecordCatSelectScreen({ navigation, route }: any) {
  const { cats } = useAppStore();
  const [query, setQuery] = useState('');
  const filtered = cats.filter((cat) => cat.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <Screen>
      <Title>どの子の記録ですか？</Title>
      <Field label="検索" placeholder="名前で検索" value={query} onChangeText={setQuery} />
      {filtered.map((cat) => (
        <Pressable
          key={cat.id}
          onPress={() =>
            navigation.navigate(
              route.params.source === 'home' ? 'HomeRecordInput' : 'RecordInput',
              {
                source: route.params.source,
                catId: cat.id,
                recordType: route.params.recordType,
              },
            )
          }
        >
          <Card>
            <View style={styles.catRow}>
              <Image source={require('../../assets/logo.PNG')} style={styles.avatar} />
              <View>
                <Text style={styles.cardTitle}>{cat.name}</Text>
                <Text style={styles.muted}>
                  {ageLabel(cat.birthDate, cat.birthDateType)}
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

type FormValues = Record<string, string | boolean>;

export function RecordInputScreen({ navigation, route }: any) {
  const { cats, addRecord, createRecordId } = useAppStore();
  const cat = cats.find((item) => item.id === route.params.catId);
  const type = route.params.recordType as RecordType;
  const [values, setValues] = useState<FormValues>({
    date: today(),
    note: '',
    foodStatus: 'ate',
    claimStatus: 'unclaimed',
    memoCategory: 'other',
    timing: 'morning',
    isGiven: true,
    healthCategory: 'appetite',
    conditionStatus: 'normal',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [allowLeave, setAllowLeave] = useState(false);
  const set = (key: string, value: string | boolean) => {
    setDirty(true);
    setValues((current) => ({ ...current, [key]: value }));
  };

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event: any) => {
        if (!dirty || allowLeave) return;
        event.preventDefault();
        Alert.alert('入力中の内容があります', '保存せずに戻りますか？', [
          { text: '戻らない', style: 'cancel' },
          {
            text: '保存せずに戻る',
            style: 'destructive',
            onPress: () => {
              setAllowLeave(true);
              navigation.dispatch(event.data.action);
            },
          },
        ]);
      }),
    [allowLeave, dirty, navigation],
  );

  const requiredError = useMemo(() => {
    if (type === 'weight' && !(Number(values.weightKg) > 0)) return '0より大きい体重を入力してください';
    if (type === 'hospital_visit' && !values.date) return '通院日を入力してください';
    if (type === 'food' && !String(values.foodName ?? '').trim()) return 'フード名を入力してください';
    if (type === 'medication' && !String(values.medicationName ?? '').trim()) return '薬名を入力してください';
    if (type === 'memo' && !String(values.body ?? '').trim()) return 'メモを入力してください';
    return '';
  }, [type, values]);

  const save = () => {
    if (requiredError) return setError(requiredError);
    setSaving(true);
    const timestamp = new Date().toISOString();
    const base = {
      id: createRecordId(),
      catId: route.params.catId as string,
      recordedAt: `${values.date}T${timestamp.slice(11)}`,
      note: String(values.note || '') || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    let record: CatRecord;
    if (type === 'weight') {
      record = { ...base, recordType: 'weight', weightKg: Number(values.weightKg) };
    } else if (type === 'hospital_visit') {
      record = {
        ...base,
        recordType: 'hospital_visit',
        visitedAt: String(values.date),
        hospitalName: String(values.hospitalName || '') || null,
        visitNote: String(values.visitNote || '') || null,
        diagnosisName: String(values.diagnosisName || '') || null,
        prescribedMedication: String(values.prescribedMedication || '') || null,
        inspectionNote: String(values.inspectionNote || '') || null,
        amount: values.amount ? Number(values.amount) : null,
        weightKg: values.weightKg ? Number(values.weightKg) : null,
        nextVisitDate: String(values.nextVisitDate || '') || null,
        insuranceClaimStatus: (values.insuranceClaimStatus as InsuranceClaimStatus) || null,
      };
    } else if (type === 'food') {
      record = {
        ...base,
        recordType: 'food',
        foodName: String(values.foodName),
        brand: String(values.brand || '') || null,
        flavor: String(values.flavor || '') || null,
        shape: String(values.shape || '') || null,
        foodStatus: values.foodStatus as FoodStatus,
      };
    } else if (type === 'insurance') {
      record = {
        ...base,
        recordType: 'insurance',
        visitDate: String(values.date) || null,
        hospitalName: String(values.hospitalName || '') || null,
        amount: values.amount ? Number(values.amount) : null,
        diagnosisName: String(values.diagnosisName || '') || null,
        claimStatus: values.claimStatus as InsuranceClaimStatus,
      };
    } else if (type === 'memo') {
      record = {
        ...base,
        recordType: 'memo',
        title: String(values.title || '') || null,
        memoCategory: values.memoCategory as MemoCategory,
        body: String(values.body),
      };
    } else if (type === 'medication') {
      record = {
        ...base,
        recordType: 'medication',
        medicationName: String(values.medicationName),
        dosage: String(values.dosage || '') || null,
        timing: values.timing as MedicationTiming,
        isGiven: Boolean(values.isGiven),
      };
    } else {
      record = {
        ...base,
        recordType: 'health_condition',
        healthCategory: values.healthCategory as HealthCategory,
        conditionStatus: values.conditionStatus as ConditionStatus,
      };
    }
    addRecord(record);
    setDirty(false);
    setAllowLeave(true);
    setSaving(false);
    const initialTab = tabForRecord(type);
    if (route.params.source === 'cat_detail') {
      navigation.navigate('CatDetail', { catId: route.params.catId, initialTab });
    } else {
      navigation.getParent()?.navigate('HomeTab', { screen: 'Home' });
    }
  };

  return (
    <Screen>
      <Title subtitle={cat?.name}>{recordTypes.find((item) => item.type === type)?.label}を記録</Title>
      <Card>
        <View style={styles.catRow}>
          <Image source={require('../../assets/logo.PNG')} style={styles.avatar} />
          <Text style={styles.cardTitle}>{cat?.name}</Text>
        </View>
      </Card>
      <Field
        label={type === 'hospital_visit' || type === 'insurance' ? '通院日' : '記録日'}
        value={String(values.date)}
        onChangeText={(text) => set('date', text)}
        placeholder="YYYY-MM-DD"
      />
      <TypeFields type={type} values={values} set={set} />
      {type !== 'memo' ? (
        <Field
          label="メモ"
          multiline
          value={String(values.note)}
          onChangeText={(text) => set('note', text)}
        />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={saving ? '保存中...' : '保存する'} disabled={saving} onPress={save} />
      <Button title="キャンセル" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

function TypeFields({
  type,
  values,
  set,
}: {
  type: RecordType;
  values: FormValues;
  set: (key: string, value: string | boolean) => void;
}) {
  if (type === 'weight') {
    return <Field label="体重（kg）" keyboardType="decimal-pad" value={String(values.weightKg ?? '')} onChangeText={(text) => set('weightKg', text)} placeholder="例：4.25" />;
  }
  if (type === 'hospital_visit') {
    return (
      <>
        <Field label="病院名" value={String(values.hospitalName ?? '')} onChangeText={(text) => set('hospitalName', text)} />
        <Field label="内容メモ" multiline value={String(values.visitNote ?? '')} onChangeText={(text) => set('visitNote', text)} />
        <Text style={styles.label}>次回予定の入力補助</Text>
        <ChoiceRow
          value={String(values.weeks ?? 'none')}
          onChange={(weeks) => {
            set('weeks', weeks);
            set('nextVisitDate', weeks === 'none' ? '' : addDays(String(values.date), Number(weeks) * 7));
          }}
          options={[
            { value: 'none', label: 'なし' },
            { value: '1', label: '1週間後' },
            { value: '2', label: '2週間後' },
            { value: '4', label: '4週間後' },
            { value: '12', label: '3ヶ月後' },
          ]}
        />
        <Field label="次回予定日" placeholder="YYYY-MM-DD" value={String(values.nextVisitDate ?? '')} onChangeText={(text) => set('nextVisitDate', text)} />
        <Field label="診断名" value={String(values.diagnosisName ?? '')} onChangeText={(text) => set('diagnosisName', text)} />
        <Field label="処方薬" value={String(values.prescribedMedication ?? '')} onChangeText={(text) => set('prescribedMedication', text)} />
        <Field label="金額" keyboardType="number-pad" value={String(values.amount ?? '')} onChangeText={(text) => set('amount', text)} />
      </>
    );
  }
  if (type === 'food') {
    return (
      <>
        <Field label="フード名（必須）" value={String(values.foodName ?? '')} onChangeText={(text) => set('foodName', text)} />
        <Field label="ブランド" value={String(values.brand ?? '')} onChangeText={(text) => set('brand', text)} />
        <Field label="味" value={String(values.flavor ?? '')} onChangeText={(text) => set('flavor', text)} />
        <Field label="形状" value={String(values.shape ?? '')} onChangeText={(text) => set('shape', text)} placeholder="ドライ、ウェットなど" />
        <Text style={styles.label}>食べたか</Text>
        <ChoiceRow
          value={values.foodStatus as FoodStatus}
          onChange={(value) => set('foodStatus', value)}
          options={[
            { value: 'favorite', label: 'よく食べる' },
            { value: 'ate', label: '食べた' },
            { value: 'ate_a_little', label: '少し食べた' },
            { value: 'did_not_eat', label: '食べなかった' },
            { value: 'got_bored', label: '飽きた' },
            { value: 'not_suitable', label: '体調に合わない' },
          ]}
        />
      </>
    );
  }
  if (type === 'insurance') {
    return (
      <>
        <Field label="病院名" value={String(values.hospitalName ?? '')} onChangeText={(text) => set('hospitalName', text)} />
        <Field label="金額" keyboardType="number-pad" value={String(values.amount ?? '')} onChangeText={(text) => set('amount', text)} />
        <Field label="診断名" value={String(values.diagnosisName ?? '')} onChangeText={(text) => set('diagnosisName', text)} />
        <Text style={styles.label}>請求ステータス</Text>
        <ChoiceRow
          value={values.claimStatus as InsuranceClaimStatus}
          onChange={(value) => set('claimStatus', value)}
          options={[
            { value: 'unclaimed', label: '未請求' },
            { value: 'preparing', label: '準備中' },
            { value: 'claimed', label: '請求済み' },
            { value: 'paid', label: '入金済み' },
            { value: 'not_applicable', label: '対象外' },
          ]}
        />
      </>
    );
  }
  if (type === 'memo') {
    return (
      <>
        <Field label="タイトル" value={String(values.title ?? '')} onChangeText={(text) => set('title', text)} />
        <Text style={styles.label}>カテゴリ</Text>
        <ChoiceRow
          value={values.memoCategory as MemoCategory}
          onChange={(value) => set('memoCategory', value)}
          options={[
            { value: 'personality', label: '性格' },
            { value: 'care', label: 'お世話' },
            { value: 'away', label: '留守中' },
            { value: 'hospital', label: '病院' },
            { value: 'family', label: '家族への申し送り' },
            { value: 'other', label: 'その他' },
          ]}
        />
        <Field label="メモ（必須）" multiline value={String(values.body ?? '')} onChangeText={(text) => set('body', text)} />
      </>
    );
  }
  if (type === 'medication') {
    return (
      <>
        <Field label="薬名（必須）" value={String(values.medicationName ?? '')} onChangeText={(text) => set('medicationName', text)} />
        <Field label="量" value={String(values.dosage ?? '')} onChangeText={(text) => set('dosage', text)} />
        <Text style={styles.label}>タイミング</Text>
        <ChoiceRow
          value={values.timing as MedicationTiming}
          onChange={(value) => set('timing', value)}
          options={[
            { value: 'morning', label: '朝' },
            { value: 'noon', label: '昼' },
            { value: 'night', label: '夜' },
            { value: 'before_sleep', label: '寝る前' },
            { value: 'other', label: 'その他' },
          ]}
        />
        <ChoiceRow
          value={String(values.isGiven)}
          onChange={(value) => set('isGiven', value === 'true')}
          options={[
            { value: 'true', label: '投薬済み' },
            { value: 'false', label: '未投薬' },
          ]}
        />
      </>
    );
  }
  return (
    <>
      <Text style={styles.label}>体調カテゴリ</Text>
      <ChoiceRow
        value={values.healthCategory as HealthCategory}
        onChange={(value) => set('healthCategory', value)}
        options={[
          { value: 'appetite', label: '食欲' },
          { value: 'vomiting', label: '嘔吐' },
          { value: 'diarrhea', label: '下痢・軟便' },
          { value: 'excretion', label: '排泄' },
          { value: 'drinking', label: '飲水' },
          { value: 'energy', label: '元気' },
          { value: 'other', label: 'その他' },
        ]}
      />
      <Text style={styles.label}>状態</Text>
      <ChoiceRow
        value={values.conditionStatus as ConditionStatus}
        onChange={(value) => set('conditionStatus', value)}
        options={[
          { value: 'good', label: '良い' },
          { value: 'normal', label: '普通' },
          { value: 'concern', label: '気になる' },
          { value: 'bad', label: '悪い' },
        ]}
      />
    </>
  );
}

const tabForRecord = (type: RecordType) =>
  type === 'food'
    ? 'food'
    : type === 'insurance'
      ? 'insurance'
      : type === 'memo'
        ? 'memo'
        : ['hospital_visit', 'medication'].includes(type)
          ? 'medical'
          : 'timeline';

const styles = StyleSheet.create({
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  muted: { color: colors.muted, lineHeight: 20 },
  catRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  avatar: { height: 64, resizeMode: 'contain', width: 64 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700' },
  error: { color: colors.danger, fontWeight: '700' },
});
