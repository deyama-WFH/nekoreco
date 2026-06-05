import { useEffect, useMemo, useState } from 'react';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { catRoutes, homeRoutes, mainTabs, recordRoutes } from '@/navigation/routes';
import { RecordFlowParams, RecordSource } from '@/navigation/types';
import { saveCatRecord, useAppStore } from '@/store/useAppStore';
import {
  ConditionStatus,
  FoodStatus,
  HealthCategory,
  InsuranceClaimStatus,
  MedicationTiming,
  MemoCategory,
  RecordType,
} from '@/types/models';
import { addDays, toDateString } from '@/utils/date';

type RecordRoute = RouteProp<Record<string, RecordFlowParams | undefined>, string>;
type SelectOption<T extends string> = { label: string; value: T };

const recordTypes: Array<{ label: string; type: RecordType; description: string }> = [
  { label: '体重', type: 'weight', description: 'kg とメモだけで素早く残します。' },
  { label: '通院', type: 'hospital_visit', description: '通院内容と次回予定を残します。' },
  { label: 'フード', type: 'food', description: '食べたか、ブランド、味を残します。' },
  { label: '保険', type: 'insurance', description: '請求状況と金額を管理します。' },
  { label: 'メモ', type: 'memo', description: '性格や申し送りなど自由に残します。' },
  { label: '投薬', type: 'medication', description: '投薬した記録を簡易保存します。' },
  { label: '体調', type: 'health_condition', description: '日常の小さな異変を残します。' },
];

const recordTypeLabels = Object.fromEntries(
  recordTypes.map((recordType) => [recordType.type, recordType.label]),
) as Record<RecordType, string>;

const foodStatusOptions: Array<SelectOption<FoodStatus>> = [
  { label: 'よく食べる', value: 'favorite' },
  { label: '食べた', value: 'ate' },
  { label: '少し食べた', value: 'ate_a_little' },
  { label: '食べなかった', value: 'did_not_eat' },
  { label: '飽きた', value: 'got_bored' },
  { label: '合わなかった', value: 'not_suitable' },
];

const claimStatusOptions: Array<SelectOption<InsuranceClaimStatus>> = [
  { label: '未請求', value: 'unclaimed' },
  { label: '準備中', value: 'preparing' },
  { label: '請求済み', value: 'claimed' },
  { label: '入金済み', value: 'paid' },
  { label: '対象外', value: 'not_applicable' },
];

const memoCategoryOptions: Array<SelectOption<MemoCategory>> = [
  { label: '性格', value: 'personality' },
  { label: 'お世話', value: 'care' },
  { label: '留守中', value: 'away' },
  { label: '病院', value: 'hospital' },
  { label: '申し送り', value: 'family' },
  { label: 'その他', value: 'other' },
];

const medicationTimingOptions: Array<SelectOption<MedicationTiming>> = [
  { label: '朝', value: 'morning' },
  { label: '昼', value: 'noon' },
  { label: '夜', value: 'night' },
  { label: '寝る前', value: 'before_sleep' },
  { label: 'その他', value: 'other' },
];

const healthCategoryOptions: Array<SelectOption<HealthCategory>> = [
  { label: '食欲', value: 'appetite' },
  { label: '嘔吐', value: 'vomiting' },
  { label: '下痢・軟便', value: 'diarrhea' },
  { label: '排泄', value: 'excretion' },
  { label: '飲水', value: 'drinking' },
  { label: '元気', value: 'energy' },
  { label: 'その他', value: 'other' },
];

const conditionStatusOptions: Array<SelectOption<ConditionStatus>> = [
  { label: '良い', value: 'good' },
  { label: '普通', value: 'normal' },
  { label: '気になる', value: 'concern' },
  { label: '悪い', value: 'bad' },
];

function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function useRecordRouteParams() {
  const route = useRoute<RecordRoute>();
  return route.params ?? {};
}

function normalizeSource(source?: RecordSource): RecordSource {
  return source ?? 'record';
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, multiline ? styles.textArea : null]}
        value={value}
      />
    </View>
  );
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<SelectOption<T>>;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityRole="button"
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected ? styles.chipSelected : null]}
            >
              <Text style={[styles.chipLabel, selected ? styles.chipLabelSelected : null]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

function nullableText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function parseAmount(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return 0;
  }

  return Number(normalized);
}

function getRecordType(value?: RecordType): RecordType | null {
  return value && recordTypes.some((recordType) => recordType.type === value) ? value : null;
}

function calculateNextVisitDate(baseDate: string, weeks: number) {
  return toDateString(addDays(new Date(`${baseDate}T00:00:00`), weeks * 7));
}

export function RecordTypeSelectScreen() {
  const navigation = useNavigation();

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>何を記録しますか？</Text>
        <View style={styles.cardList}>
          {recordTypes.map((recordType) => (
            <Pressable
              accessibilityRole="button"
              key={recordType.type}
              onPress={() =>
                navigation.dispatch(
                  CommonActions.navigate(recordRoutes.catSelect, {
                    recordType: recordType.type,
                    source: 'record',
                  }),
                )
              }
              style={({ pressed }) => [styles.optionCard, pressed ? styles.pressed : null]}
            >
              <Text style={styles.cardTitle}>{recordType.label}</Text>
              <Text style={styles.bodyText}>{recordType.description}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

export function RecordCatSelectScreen() {
  const navigation = useNavigation();
  const params = useRecordRouteParams();
  const [query, setQuery] = useState('');
  const cats = useAppStore((state) => state.cats);
  const recordType = getRecordType(params.recordType);
  const source = normalizeSource(params.source);

  const filteredCats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return cats;
    }

    return cats.filter((cat) => cat.name.toLowerCase().includes(normalizedQuery));
  }, [cats, query]);

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>どの子の記録ですか？</Text>
          <Text style={styles.bodyText}>
            {recordType
              ? `${recordTypeLabels[recordType]}を記録する猫を選びます。`
              : '先に記録タイプを選んでください。'}
          </Text>
        </View>

        <TextInput
          onChangeText={setQuery}
          placeholder="名前で検索"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={query}
        />

        {cats.length === 0 ? (
          <Card>
            <Text style={styles.cardTitle}>猫ちゃんが未登録です</Text>
            <Text style={styles.bodyText}>先に猫を登録すると、記録を追加できます。</Text>
          </Card>
        ) : (
          <View style={styles.cardList}>
            {filteredCats.map((cat) => (
              <Pressable
                accessibilityRole="button"
                key={cat.id}
                onPress={() =>
                  navigation.dispatch(
                    CommonActions.navigate(recordRoutes.input, {
                      catId: cat.id,
                      recordType,
                      source,
                    }),
                  )
                }
                style={({ pressed }) => [styles.optionCard, pressed ? styles.pressed : null]}
              >
                <Text style={styles.cardTitle}>{cat.name}</Text>
                <Text style={styles.bodyText}>
                  {cat.sex === 'male' ? 'オス' : cat.sex === 'female' ? 'メス' : '不明'} /{' '}
                  {cat.coatColorPattern ?? '毛色・柄未登録'}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

export function RecordInputScreen() {
  const navigation = useNavigation();
  const params = useRecordRouteParams();
  const cats = useAppStore((state) => state.cats);
  const cat = cats.find((item) => item.id === params.catId);
  const recordType = getRecordType(params.recordType);
  const source = normalizeSource(params.source);
  const today = toDateString(new Date());
  const [recordDate, setRecordDate] = useState(today);
  const [memo, setMemo] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [summary, setSummary] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [foodName, setFoodName] = useState('');
  const [brand, setBrand] = useState('');
  const [flavor, setFlavor] = useState('');
  const [foodStatus, setFoodStatus] = useState<FoodStatus>('ate');
  const [amountYen, setAmountYen] = useState('');
  const [diagnosisName, setDiagnosisName] = useState('');
  const [claimStatus, setClaimStatus] = useState<InsuranceClaimStatus>('unclaimed');
  const [memoTitle, setMemoTitle] = useState('');
  const [memoCategory, setMemoCategory] = useState<MemoCategory>('other');
  const [memoBody, setMemoBody] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [medicationTiming, setMedicationTiming] = useState<MedicationTiming>('other');
  const [healthCategory, setHealthCategory] = useState<HealthCategory>('other');
  const [conditionStatus, setConditionStatus] = useState<ConditionStatus>('normal');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<unknown>(null);
  const [canLeave, setCanLeave] = useState(false);

  const isDirty =
    recordDate !== today ||
    memo.trim().length > 0 ||
    weightKg.trim().length > 0 ||
    hospitalName.trim().length > 0 ||
    summary.trim().length > 0 ||
    nextVisitDate.trim().length > 0 ||
    foodName.trim().length > 0 ||
    brand.trim().length > 0 ||
    flavor.trim().length > 0 ||
    amountYen.trim().length > 0 ||
    diagnosisName.trim().length > 0 ||
    memoTitle.trim().length > 0 ||
    memoBody.trim().length > 0 ||
    medicineName.trim().length > 0 ||
    foodStatus !== 'ate' ||
    claimStatus !== 'unclaimed' ||
    memoCategory !== 'other' ||
    medicationTiming !== 'other' ||
    healthCategory !== 'other' ||
    conditionStatus !== 'normal';

  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (!isDirty || canLeave || isSaving) {
        return;
      }

      event.preventDefault();
      setPendingAction(event.data.action);
      setIsDiscardDialogOpen(true);
    });
  }, [canLeave, isDirty, isSaving, navigation]);

  if (!cat || !recordType) {
    return (
      <ScreenShell>
        <ScrollView contentContainerStyle={styles.container}>
          <Card>
            <Text style={styles.cardTitle}>記録を開始できません</Text>
            <Text style={styles.bodyText}>猫または記録タイプが選択されていません。</Text>
          </Card>
          <AppButton
            label="記録タイプへ戻る"
            onPress={() => navigation.dispatch(CommonActions.navigate(recordRoutes.typeSelect))}
          />
        </ScrollView>
      </ScreenShell>
    );
  }

  const selectedCatId = cat.id;
  const selectedCatName = cat.name;

  function discardAndLeave() {
    setCanLeave(true);
    setIsDiscardDialogOpen(false);

    if (pendingAction) {
      navigation.dispatch(pendingAction as never);
      return;
    }

    navigation.goBack();
  }

  function validateCommon() {
    if (!isValidDate(recordDate)) {
      return '日付は YYYY-MM-DD 形式で入力してください。';
    }

    return null;
  }

  async function handleSave() {
    const commonError = validateCommon();

    if (commonError) {
      setError(commonError);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (recordType === 'weight') {
        const parsedWeight = Number(weightKg);
        if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
          setError('体重は 0 より大きい数値で入力してください。');
          return;
        }

        await saveCatRecord({
          catId: selectedCatId,
          type: 'weight',
          recordDate,
          memo: nullableText(memo),
          weightKg: parsedWeight,
        });
      }

      if (recordType === 'hospital_visit') {
        await saveCatRecord({
          catId: selectedCatId,
          type: 'hospital_visit',
          recordDate,
          memo: nullableText(memo),
          hospitalName: hospitalName.trim() || '未登録の病院',
          summary: summary.trim() || '通院記録',
          nextVisitDate: nullableText(nextVisitDate),
        });
      }

      if (recordType === 'food') {
        if (!foodName.trim()) {
          setError('フード名を入力してください。');
          return;
        }

        await saveCatRecord({
          catId: selectedCatId,
          type: 'food',
          recordDate,
          memo: nullableText(memo),
          foodName: foodName.trim(),
          status: foodStatus,
          brand: nullableText(brand),
          flavor: nullableText(flavor),
        });
      }

      if (recordType === 'insurance') {
        const amount = parseAmount(amountYen);
        if (!Number.isFinite(amount) || amount < 0) {
          setError('金額は 0 以上の数値で入力してください。');
          return;
        }

        await saveCatRecord({
          catId: selectedCatId,
          type: 'insurance',
          recordDate,
          memo: nullableText(memo),
          hospitalName: hospitalName.trim() || '未登録の病院',
          amountYen: amount,
          diagnosisName: nullableText(diagnosisName),
          claimStatus,
        });
      }

      if (recordType === 'memo') {
        if (!memoBody.trim()) {
          setError('本文を入力してください。');
          return;
        }

        await saveCatRecord({
          catId: selectedCatId,
          type: 'memo',
          recordDate,
          memo: nullableText(memo),
          title: memoTitle.trim() || 'メモ',
          category: memoCategory,
          body: memoBody.trim(),
        });
      }

      if (recordType === 'medication') {
        if (!medicineName.trim()) {
          setError('薬名を入力してください。');
          return;
        }

        await saveCatRecord({
          catId: selectedCatId,
          type: 'medication',
          recordDate,
          memo: nullableText(memo),
          medicineName: medicineName.trim(),
          timing: medicationTiming,
        });
      }

      if (recordType === 'health_condition') {
        await saveCatRecord({
          catId: selectedCatId,
          type: 'health_condition',
          recordDate,
          memo: nullableText(memo),
          category: healthCategory,
          status: conditionStatus,
        });
      }

      setCanLeave(true);
      navigateAfterSave(source, selectedCatId);
    } catch {
      setError('保存できませんでした。時間をおいてもう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  }

  function navigateAfterSave(recordSource: RecordSource, catId: string) {
    if (recordSource === 'cat') {
      navigation.dispatch(CommonActions.navigate(catRoutes.detail, { catId }));
      return;
    }

    if (recordSource === 'home') {
      navigation.dispatch(
        CommonActions.navigate(mainTabs.home, {
          screen: homeRoutes.home,
        }),
      );
      return;
    }

    navigation.dispatch(CommonActions.navigate(recordRoutes.typeSelect));
  }

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>{recordTypeLabels[recordType]}を記録</Text>
          <Text style={styles.bodyText}>{selectedCatName}の記録として保存します。</Text>
        </View>

        <Card>
          <View style={styles.form}>
            <Field
              label="記録日"
              onChangeText={setRecordDate}
              placeholder="YYYY-MM-DD"
              value={recordDate}
            />

            {recordType === 'weight' ? (
              <Field
                keyboardType="decimal-pad"
                label="体重 kg"
                onChangeText={setWeightKg}
                placeholder="4.8"
                value={weightKg}
              />
            ) : null}

            {recordType === 'hospital_visit' || recordType === 'insurance' ? (
              <>
                <Field
                  label="病院名"
                  onChangeText={setHospitalName}
                  placeholder="ねこれこ動物病院"
                  value={hospitalName}
                />
                {recordType === 'hospital_visit' ? (
                  <>
                    <Field
                      label="内容メモ"
                      multiline
                      onChangeText={setSummary}
                      placeholder="診察内容、先生からの説明など"
                      value={summary}
                    />
                    <View style={styles.quickDateRow}>
                      {[1, 2, 3, 4].map((weeks) => (
                        <Pressable
                          accessibilityRole="button"
                          key={weeks}
                          onPress={() =>
                            setNextVisitDate(calculateNextVisitDate(recordDate, weeks))
                          }
                          style={styles.quickDateChip}
                        >
                          <Text style={styles.quickDateLabel}>{weeks}週間後</Text>
                        </Pressable>
                      ))}
                    </View>
                    <Field
                      label="次回予定日"
                      onChangeText={setNextVisitDate}
                      placeholder="YYYY-MM-DD"
                      value={nextVisitDate}
                    />
                  </>
                ) : (
                  <>
                    <Field
                      keyboardType="number-pad"
                      label="金額"
                      onChangeText={setAmountYen}
                      placeholder="5500"
                      value={amountYen}
                    />
                    <Field
                      label="診断名"
                      onChangeText={setDiagnosisName}
                      placeholder="皮膚炎など"
                      value={diagnosisName}
                    />
                    <OptionGroup
                      label="請求ステータス"
                      onChange={setClaimStatus}
                      options={claimStatusOptions}
                      value={claimStatus}
                    />
                  </>
                )}
              </>
            ) : null}

            {recordType === 'food' ? (
              <>
                <Field
                  label="フード名"
                  onChangeText={setFoodName}
                  placeholder="チキンドライ"
                  value={foodName}
                />
                <Field label="ブランド" onChangeText={setBrand} placeholder="任意" value={brand} />
                <Field
                  label="味"
                  onChangeText={setFlavor}
                  placeholder="チキンなど"
                  value={flavor}
                />
                <OptionGroup
                  label="食べたか"
                  onChange={setFoodStatus}
                  options={foodStatusOptions}
                  value={foodStatus}
                />
              </>
            ) : null}

            {recordType === 'memo' ? (
              <>
                <Field
                  label="タイトル"
                  onChangeText={setMemoTitle}
                  placeholder="家族への申し送り"
                  value={memoTitle}
                />
                <OptionGroup
                  label="カテゴリ"
                  onChange={setMemoCategory}
                  options={memoCategoryOptions}
                  value={memoCategory}
                />
                <Field
                  label="本文"
                  multiline
                  onChangeText={setMemoBody}
                  placeholder="記録したい内容"
                  value={memoBody}
                />
              </>
            ) : null}

            {recordType === 'medication' ? (
              <>
                <Field
                  label="薬名"
                  onChangeText={setMedicineName}
                  placeholder="薬の名前"
                  value={medicineName}
                />
                <OptionGroup
                  label="タイミング"
                  onChange={setMedicationTiming}
                  options={medicationTimingOptions}
                  value={medicationTiming}
                />
              </>
            ) : null}

            {recordType === 'health_condition' ? (
              <>
                <OptionGroup
                  label="体調カテゴリ"
                  onChange={setHealthCategory}
                  options={healthCategoryOptions}
                  value={healthCategory}
                />
                <OptionGroup
                  label="状態"
                  onChange={setConditionStatus}
                  options={conditionStatusOptions}
                  value={conditionStatus}
                />
              </>
            ) : null}

            <Field label="メモ" multiline onChangeText={setMemo} placeholder="任意" value={memo} />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.rowActions}>
              <AppButton
                disabled={isSaving}
                label={isSaving ? '保存中...' : '保存する'}
                onPress={handleSave}
              />
              <AppButton
                label="キャンセル"
                onPress={() => {
                  if (isDirty) {
                    setPendingAction(null);
                    setIsDiscardDialogOpen(true);
                    return;
                  }

                  navigation.goBack();
                }}
                variant="secondary"
              />
            </View>
          </View>
        </Card>
      </ScrollView>

      <UnsavedChangesDialog
        isVisible={isDiscardDialogOpen}
        onCancel={() => setIsDiscardDialogOpen(false)}
        onDiscard={discardAndLeave}
      />
    </ScreenShell>
  );
}

function UnsavedChangesDialog({
  isVisible,
  onCancel,
  onDiscard,
}: {
  isVisible: boolean;
  onCancel: () => void;
  onDiscard: () => void;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={isVisible}>
      <View style={styles.dialogBackdrop}>
        <View style={styles.dialog}>
          <Text style={styles.cardTitle}>入力中の内容があります</Text>
          <Text style={styles.bodyText}>保存せずに戻りますか？</Text>
          <View style={styles.rowActions}>
            <AppButton label="戻らない" onPress={onCancel} />
            <AppButton label="保存せずに戻る" onPress={onDiscard} variant="secondary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '700',
  },
  cardList: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  bodyText: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  textArea: {
    minHeight: 96,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  chipLabelSelected: {
    color: colors.onPrimary,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickDateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickDateChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  quickDateLabel: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  errorText: {
    color: colors.warning,
    fontSize: typography.body,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
  dialogBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(38, 48, 47, 0.28)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.lg,
    width: '100%',
  },
});
