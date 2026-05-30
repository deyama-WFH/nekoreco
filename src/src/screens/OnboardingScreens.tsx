import { useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
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
import { onboardingRoutes } from '@/navigation/routes';
import { OnboardingStackParamList } from '@/navigation/types';
import {
  addFirstCat,
  completeOnboarding,
  saveAdditionalInfo,
  useAppStore,
} from '@/store/useAppStore';
import { AdoptionDateType, BirthDateType, BreedType, CatSex } from '@/types/models';

type OnboardingProps<RouteName extends keyof OnboardingStackParamList> = NativeStackScreenProps<
  OnboardingStackParamList,
  RouteName
>;

type AdditionalCategoryId =
  OnboardingStackParamList[typeof onboardingRoutes.additionalInfoInput]['categoryId'];

const sexOptions: Array<{ label: string; value: CatSex }> = [
  { label: 'オス', value: 'male' },
  { label: 'メス', value: 'female' },
  { label: '不明', value: 'unknown' },
];

const birthDateOptions: Array<{ label: string; value: BirthDateType }> = [
  { label: '正確な日付', value: 'exact' },
  { label: '推定', value: 'estimated' },
  { label: '不明', value: 'unknown' },
];

const adoptionDateOptions: Array<{ label: string; value: AdoptionDateType }> = [
  { label: '日付を入力', value: 'exact' },
  { label: 'あとで入力', value: 'unknown' },
];

const breedOptions: Array<{ label: string; value: BreedType }> = [
  { label: '猫種・血統を入力', value: 'purebred' },
  { label: '雑種', value: 'mixed' },
  { label: '不明', value: 'unknown' },
];

const additionalCategories: Array<{
  id: AdditionalCategoryId;
  title: string;
  description: string;
}> = [
  {
    id: 'medical_prevention',
    title: '医療・予防',
    description: 'ワクチン、駆虫、避妊去勢、病歴を記録します。',
  },
  {
    id: 'hospital_insurance',
    title: '病院・保険',
    description: 'かかりつけ病院、主治医、保険情報を記録します。',
  },
  {
    id: 'food',
    title: 'ごはん',
    description: 'いつものフード、好き嫌い、アレルギーを記録します。',
  },
  {
    id: 'care_notes',
    title: 'お世話・注意事項',
    description: '投薬、性格、苦手なこと、家族への申し送りを記録します。',
  },
  {
    id: 'anniversary_notifications',
    title: '記念日・通知',
    description: '誕生日、うちの子記念日、予防予定の通知設定を記録します。',
  },
];

const categoryFields: Record<AdditionalCategoryId, Array<{ key: string; label: string }>> = {
  medical_prevention: [
    { key: 'vaccineDate', label: 'ワクチン接種日' },
    { key: 'nextVaccineDate', label: '次回ワクチン予定日' },
    { key: 'dewormingDate', label: '駆虫日' },
    { key: 'nextDewormingDate', label: '次回駆虫予定日' },
    { key: 'sterilizationStatus', label: '避妊去勢状況 done / not_done / unknown' },
    { key: 'medicalHistory', label: '病歴' },
    { key: 'medicalNote', label: '医療メモ' },
  ],
  hospital_insurance: [
    { key: 'primaryHospitalName', label: 'かかりつけ病院' },
    { key: 'primaryDoctorName', label: '主治医' },
    { key: 'hospitalPhoneNumber', label: '病院電話番号' },
    { key: 'insuranceName', label: 'ペット保険名' },
    { key: 'insurancePlan', label: '保険プラン' },
    { key: 'insurancePolicyNumber', label: '証券番号' },
    { key: 'insuranceNote', label: '保険メモ' },
  ],
  food: [
    { key: 'regularFood', label: 'いつものフード' },
    { key: 'favoriteFood', label: '好きなごはん' },
    { key: 'dislikedFood', label: '苦手なごはん' },
    { key: 'foodAllergies', label: 'アレルギー' },
    { key: 'foodNote', label: '食事メモ' },
  ],
  care_notes: [
    { key: 'hasMedication', label: '投薬の有無' },
    { key: 'medicationNote', label: '投薬メモ' },
    { key: 'personality', label: '性格' },
    { key: 'dislikes', label: '苦手なこと' },
    { key: 'awayCareNote', label: '留守中の注意' },
    { key: 'familyNote', label: '家族への申し送り' },
  ],
  anniversary_notifications: [
    { key: 'birthdayReminderEnabled', label: '誕生日通知 true / false' },
    { key: 'adoptionReminderEnabled', label: 'うちの子記念日通知 true / false' },
    { key: 'vaccineReminderEnabled', label: 'ワクチン通知 true / false' },
    { key: 'dewormingReminderEnabled', label: '駆虫通知 true / false' },
    { key: 'hospitalVisitReminderEnabled', label: '通院予定通知 true / false' },
    { key: 'reminderDaysBefore', label: '通知タイミング（日数）' },
  ],
};

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
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
  options: Array<{ label: string; value: T }>;
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

export function OnboardingSplashScreen({
  navigation,
}: OnboardingProps<typeof onboardingRoutes.splash>) {
  useEffect(() => {
    const timerId = setTimeout(() => {
      navigation.replace(onboardingRoutes.welcome);
    }, 1200);

    return () => clearTimeout(timerId);
  }, [navigation]);

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.logo}>nekoreco</Text>
        <Text style={styles.heroTitle}>ねこれこ</Text>
        <Text style={styles.heroText}>
          たくさんの“うちの子”を、ひとりずつ大切に記録。
        </Text>
      </View>
    </ScreenShell>
  );
}

export function OnboardingWelcomeScreen({
  navigation,
}: OnboardingProps<typeof onboardingRoutes.welcome>) {
  return (
    <ScreenShell>
      <View>
        <Text style={styles.title}>ねこれこへようこそ</Text>
        <Text style={styles.description}>
          猫ごとの健康、ごはん、通院、記念日を家族でわかりやすく管理できます。
        </Text>
      </View>

      <View style={styles.featureList}>
        {['猫ごとの情報をまとめて管理', '通院・ワクチン・駆虫を見える化', '家族への申し送りを残せる'].map(
          (feature) => (
            <Card key={feature}>
              <Text style={styles.featureText}>{feature}</Text>
            </Card>
          ),
        )}
      </View>

      <AppButton
        label="はじめる"
        onPress={() => navigation.navigate(onboardingRoutes.firstCatRegistration)}
      />
    </ScreenShell>
  );
}

export function FirstCatRegistrationScreen({
  navigation,
}: OnboardingProps<typeof onboardingRoutes.firstCatRegistration>) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [name, setName] = useState('');
  const [sex, setSex] = useState<CatSex>('unknown');
  const [birthDateType, setBirthDateType] = useState<BirthDateType>('unknown');
  const [birthDate, setBirthDate] = useState('');
  const [adoptionDateType, setAdoptionDateType] = useState<AdoptionDateType>('unknown');
  const [adoptionDate, setAdoptionDate] = useState('');
  const [breedType, setBreedType] = useState<BreedType>('unknown');
  const [breed, setBreed] = useState('');
  const [coatColorPattern, setCoatColorPattern] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canShowBirthDate = birthDateType !== 'unknown';
  const canShowAdoptionDate = adoptionDateType === 'exact';
  const canShowBreed = breedType === 'purebred';

  async function handleSubmit() {
    const trimmedName = name.trim();
    const today = todayString();

    if (!trimmedName) {
      setError('名前を入力してください。');
      return;
    }

    if (trimmedName.length > 30) {
      setError('名前は30文字以内で入力してください。');
      return;
    }

    if (canShowBirthDate && (!isValidDate(birthDate) || birthDate > today)) {
      setError('生年月日は YYYY-MM-DD 形式で、未来日以外を入力してください。');
      return;
    }

    if (canShowAdoptionDate && (!isValidDate(adoptionDate) || adoptionDate > today)) {
      setError('うちの子記念日は YYYY-MM-DD 形式で、未来日以外を入力してください。');
      return;
    }

    setIsSaving(true);
    const cat = await addFirstCat({
      name: trimmedName,
      photoUrl: photoUrl.trim() || null,
      sex,
      birthDate: canShowBirthDate ? birthDate : null,
      birthDateType,
      adoptionDate: canShowAdoptionDate ? adoptionDate : null,
      adoptionDateType,
      breed: breedType === 'mixed' ? '雑種' : canShowBreed ? breed.trim() || null : null,
      breedType,
      coatColorPattern: coatColorPattern.trim() || null,
    });
    setIsSaving(false);

    navigation.replace(onboardingRoutes.complete, { catId: cat.id });
  }

  return (
    <ScreenShell>
      <View>
        <Text style={styles.title}>最初の猫ちゃんを登録しましょう</Text>
        <Text style={styles.description}>
          あとから変更・追加できます。わかる範囲で入力してください。
        </Text>
      </View>

      <Card>
        <View style={styles.form}>
          <Field
            label="写真"
            onChangeText={setPhotoUrl}
            placeholder="画像URLなど。未入力でも登録できます"
            value={photoUrl}
          />
          <Field label="名前" onChangeText={setName} placeholder="例: まる" value={name} />
          <OptionGroup label="性別" onChange={setSex} options={sexOptions} value={sex} />
          <OptionGroup
            label="生年月日の状態"
            onChange={setBirthDateType}
            options={birthDateOptions}
            value={birthDateType}
          />
          {canShowBirthDate ? (
            <Field
              label="生年月日"
              onChangeText={setBirthDate}
              placeholder="YYYY-MM-DD"
              value={birthDate}
            />
          ) : null}
          <OptionGroup
            label="うちの子記念日"
            onChange={setAdoptionDateType}
            options={adoptionDateOptions}
            value={adoptionDateType}
          />
          {canShowAdoptionDate ? (
            <Field
              label="うちの子記念日の日付"
              onChangeText={setAdoptionDate}
              placeholder="YYYY-MM-DD"
              value={adoptionDate}
            />
          ) : null}
          <OptionGroup
            label="猫種・血統"
            onChange={setBreedType}
            options={breedOptions}
            value={breedType}
          />
          {canShowBreed ? (
            <Field label="猫種・血統名" onChangeText={setBreed} value={breed} />
          ) : null}
          <Field
            label="毛色・柄"
            onChangeText={setCoatColorPattern}
            placeholder="例: キジ白、三毛、黒"
            value={coatColorPattern}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </Card>

      <AppButton label={isSaving ? '登録中...' : '登録する'} onPress={handleSubmit} />
    </ScreenShell>
  );
}

export function CatRegistrationCompleteScreen({
  navigation,
  route,
}: OnboardingProps<typeof onboardingRoutes.complete>) {
  const cat = useAppStore((state) =>
    state.cats.find((catItem) => catItem.id === route.params.catId),
  );

  async function finishOnboarding() {
    await completeOnboarding();
  }

  return (
    <ScreenShell>
      <Card>
        <Text style={styles.title}>{cat?.name ?? '猫ちゃん'}を登録しました。</Text>
        <Text style={styles.description}>
          続けて詳しい情報を入力すると、通院や通知の管理がしやすくなります。
        </Text>
      </Card>

      <View style={styles.actions}>
        <AppButton
          label="詳しい情報も入力する"
          onPress={() =>
            navigation.navigate(onboardingRoutes.additionalInfoCategory, {
              catId: route.params.catId,
              source: 'onboarding',
            })
          }
        />
        <AppButton label="あとで入力する" onPress={finishOnboarding} variant="secondary" />
      </View>
    </ScreenShell>
  );
}

export function AdditionalInfoCategoryScreen({
  navigation,
  route,
}: OnboardingProps<typeof onboardingRoutes.additionalInfoCategory>) {
  async function finishOnboarding() {
    await completeOnboarding();
  }

  return (
    <ScreenShell>
      <View>
        <Text style={styles.title}>詳しい情報を追加しましょう</Text>
        <Text style={styles.description}>
          必要な項目だけ入力できます。あとからいつでも追加・変更できます。
        </Text>
      </View>

      <View style={styles.featureList}>
        {additionalCategories.map((category) => (
          <Pressable
            accessibilityRole="button"
            key={category.id}
            onPress={() =>
              navigation.navigate(onboardingRoutes.additionalInfoInput, {
                catId: route.params.catId,
                categoryId: category.id,
              })
            }
          >
            <Card>
              <Text style={styles.cardTitle}>{category.title}</Text>
              <Text style={styles.cardDescription}>{category.description}</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <AppButton
        label="完了してホームへ"
        onPress={finishOnboarding}
        variant="secondary"
      />
    </ScreenShell>
  );
}

export function AdditionalInfoInputScreen({
  navigation,
  route,
}: OnboardingProps<typeof onboardingRoutes.additionalInfoInput>) {
  const category = useMemo(
    () => additionalCategories.find((item) => item.id === route.params.categoryId),
    [route.params.categoryId],
  );
  const fields = categoryFields[route.params.categoryId];
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    await saveAdditionalInfo(route.params.catId, route.params.categoryId, values);
    setIsSaving(false);
    navigation.goBack();
  }

  async function finishOnboarding() {
    await completeOnboarding();
  }

  return (
    <ScreenShell>
      <View>
        <Text style={styles.title}>{category?.title ?? '詳しい情報'}</Text>
        <Text style={styles.description}>
          入力できるところだけで大丈夫です。空欄は保存時に無視されます。
        </Text>
      </View>

      <Card>
        <View style={styles.form}>
          {fields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              multiline={field.key.toLowerCase().includes('note')}
              onChangeText={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
              value={values[field.key] ?? ''}
            />
          ))}
        </View>
      </Card>

      <View style={styles.actions}>
        <AppButton label={isSaving ? '保存中...' : '保存する'} onPress={handleSave} />
        <AppButton label="スキップ" onPress={() => navigation.goBack()} variant="secondary" />
        <AppButton
          label="完了してホームへ"
          onPress={finishOnboarding}
          variant="secondary"
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 520,
  },
  logo: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '700',
  },
  heroText: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '700',
    lineHeight: 40,
  },
  description: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
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
    paddingVertical: spacing.sm,
  },
  textArea: {
    minHeight: 96,
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
  error: {
    color: colors.warning,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  cardDescription: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
});
