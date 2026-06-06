import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { Button, Card, ChoiceRow, Field, Screen, Title } from '../components/ui';
import type {
  AdditionalInfoCategory,
  OnboardingStackParamList,
} from '../navigation/types';
import { persistCatPhoto } from '../services/catPhotos';
import { useAppStore } from '../store/AppStore';
import { colors, theme } from '../theme';
import type {
  AdoptionDateType,
  BirthDateType,
  BreedType,
  CatSex,
  Profiles,
} from '../types/models';
import { today } from '../utils/date';

type Props<Name extends keyof OnboardingStackParamList> = NativeStackScreenProps<
  OnboardingStackParamList,
  Name
>;

export function OnboardingSplashScreen({ navigation }: Props<'OnboardingSplash'>) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('OnboardingWelcome'), 1600);
    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <View style={styles.splash}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.brand}>ねこレコ</Text>
      <Text style={styles.catchcopy}>たくさんの“うちの子”を、ひとりずつ大切に記録。</Text>
    </View>
  );
}

export function OnboardingWelcomeScreen({ navigation }: Props<'OnboardingWelcome'>) {
  return (
    <Screen contentStyle={styles.centered}>
      <Image source={require('../../assets/logo.png')} style={styles.welcomeLogo} />
      <Title subtitle="猫ごとの健康・ごはん・通院・記念日を、家族でわかりやすく管理できます。">
        ねこレコへようこそ
      </Title>
      {['猫ごとの情報をまとめて管理', '通院・ワクチン・駆虫薬を通知', '家族とお世話情報を共有'].map(
        (item) => (
          <Card key={item}>
            <Text style={styles.feature}>{item}</Text>
          </Card>
        ),
      )}
      <Button title="はじめる" onPress={() => navigation.navigate('FirstCatRegistration')} />
    </Screen>
  );
}

type CatFormValue = {
  photoUrl: string;
  name: string;
  sex: CatSex;
  birthDate: string;
  birthDateType: BirthDateType;
  adoptionDate: string;
  adoptionDateType: AdoptionDateType;
  breed: string;
  breedType: BreedType;
  coatColorPattern: string;
};

export function CatProfileForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<CatFormValue>;
  submitLabel: string;
  onSubmit: (value: CatFormValue) => void;
}) {
  const [value, setValue] = useState<CatFormValue>({
    photoUrl: '',
    name: '',
    sex: 'unknown',
    birthDate: '',
    birthDateType: 'unknown',
    adoptionDate: '',
    adoptionDateType: 'unknown',
    breed: '',
    breedType: 'unknown',
    coatColorPattern: '',
    ...initial,
  });
  const [error, setError] = useState('');
  const patch = <K extends keyof CatFormValue>(key: K, next: CatFormValue[K]) =>
    setValue((current) => ({ ...current, [key]: next }));
  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        '写真へのアクセスが必要です',
        '猫ちゃんのプロフィール写真を選ぶため、設定から写真へのアクセスを許可してください。',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    const asset = result.assets?.[0];
    if (!result.canceled && asset) {
      patch('photoUrl', persistCatPhoto(asset.uri, asset.fileName));
    }
  };
  const submit = () => {
    const name = value.name.trim();
    if (!name) return setError('名前を入力してください');
    if (name.length > 30) return setError('名前は30文字以内で入力してください');
    if (
      [value.birthDate, value.adoptionDate].some(
        (date) => date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today()),
      )
    ) {
      return setError('日付を確認してください（YYYY-MM-DD、未来日は入力できません）');
    }
    setError('');
    onSubmit({ ...value, name });
  };
  return (
    <>
      <Card style={styles.photoCard}>
        <Image
          source={value.photoUrl ? { uri: value.photoUrl } : require('../../assets/logo.png')}
          style={styles.photoPlaceholder}
        />
        <Button
          title={value.photoUrl ? '写真を変更する' : '写真を選ぶ'}
          variant="secondary"
          onPress={() => void pickPhoto()}
        />
        {value.photoUrl ? (
          <Button title="写真を外す" variant="ghost" onPress={() => patch('photoUrl', '')} />
        ) : (
          <Text style={styles.helper}>写真はあとから設定できます</Text>
        )}
      </Card>
      <Field
        label="名前（必須）"
        value={value.name}
        onChangeText={(text) => patch('name', text)}
        error={error || undefined}
        maxLength={31}
        placeholder="例：りお"
      />
      <Text style={styles.label}>性別</Text>
      <ChoiceRow
        value={value.sex}
        onChange={(sex) => patch('sex', sex)}
        options={[
          { value: 'male', label: 'オス' },
          { value: 'female', label: 'メス' },
          { value: 'unknown', label: '不明' },
        ]}
      />
      <Text style={styles.label}>生年月日</Text>
      <ChoiceRow
        value={value.birthDateType}
        onChange={(type) => patch('birthDateType', type)}
        options={[
          { value: 'exact', label: '正確な日付' },
          { value: 'estimated', label: '推定' },
          { value: 'unknown', label: '不明' },
        ]}
      />
      {value.birthDateType !== 'unknown' ? (
        <Field
          label="生年月日"
          placeholder="YYYY-MM-DD"
          value={value.birthDate}
          onChangeText={(text) => patch('birthDate', text)}
        />
      ) : null}
      <Text style={styles.label}>うちの子記念日</Text>
      <ChoiceRow
        value={value.adoptionDateType}
        onChange={(type) => patch('adoptionDateType', type)}
        options={[
          { value: 'exact', label: '日付を入力する' },
          { value: 'unknown', label: '不明 / あとで入力' },
        ]}
      />
      {value.adoptionDateType === 'exact' ? (
        <Field
          label="うちの子記念日"
          placeholder="YYYY-MM-DD"
          value={value.adoptionDate}
          onChangeText={(text) => patch('adoptionDate', text)}
        />
      ) : null}
      <Text style={styles.label}>猫種・血統</Text>
      <ChoiceRow
        value={value.breedType}
        onChange={(type) => patch('breedType', type)}
        options={[
          { value: 'purebred', label: '猫種を入力' },
          { value: 'mixed', label: '雑種' },
          { value: 'unknown', label: '不明' },
        ]}
      />
      {value.breedType === 'purebred' ? (
        <Field
          label="猫種・血統"
          value={value.breed}
          onChangeText={(text) => patch('breed', text)}
          placeholder="例：スコティッシュフォールド"
        />
      ) : null}
      <Field
        label="毛色・柄"
        value={value.coatColorPattern}
        onChangeText={(text) => patch('coatColorPattern', text)}
        placeholder="例：キジ白、三毛、黒"
      />
      <Button title={submitLabel} onPress={submit} />
    </>
  );
}

export function FirstCatRegistrationScreen({ navigation }: Props<'FirstCatRegistration'>) {
  const { addCat } = useAppStore();
  return (
    <Screen>
      <Title subtitle="あとから変更・追加できます。わかる範囲で入力してください。">
        最初の猫ちゃんを登録しましょう
      </Title>
      <CatProfileForm
        submitLabel="登録する"
        onSubmit={(value) => {
          const catId = addCat({
            name: value.name,
            sex: value.sex,
            birthDate: value.birthDateType === 'unknown' ? null : value.birthDate || null,
            birthDateType: value.birthDateType,
            adoptionDate:
              value.adoptionDateType === 'unknown' ? null : value.adoptionDate || null,
            adoptionDateType: value.adoptionDateType,
            breed:
              value.breedType === 'mixed'
                ? '雑種'
                : value.breedType === 'unknown'
                  ? null
                  : value.breed || null,
            breedType: value.breedType,
            coatColorPattern: value.coatColorPattern || null,
            photoUrl: value.photoUrl || null,
          });
          navigation.navigate('CatRegistrationComplete', { catId });
        }}
      />
    </Screen>
  );
}

export function CatRegistrationCompleteScreen({
  navigation,
  route,
}: Props<'CatRegistrationComplete'>) {
  const { cats, completeOnboarding } = useAppStore();
  const cat = cats.find((item) => item.id === route.params.catId);
  return (
    <Screen contentStyle={styles.centered}>
      <Image source={require('../../assets/logo.png')} style={styles.welcomeLogo} />
      <Title subtitle="続けて詳しい情報を入力すると、通知や家族共有がもっと便利になります。">
        {cat?.name ?? '猫ちゃん'}ちゃんを登録しました！
      </Title>
      <Button
        title="詳しい情報も入力する"
        onPress={() =>
          navigation.navigate('AdditionalInfoCategory', {
            catId: route.params.catId,
            source: 'onboarding',
          })
        }
      />
      <Button title="あとで入力する" variant="secondary" onPress={completeOnboarding} />
    </Screen>
  );
}

const categories: Array<{ id: AdditionalInfoCategory; title: string; description: string }> = [
  { id: 'medical_prevention', title: '医療・予防', description: 'ワクチン、駆虫薬、病歴' },
  { id: 'hospital_insurance', title: '病院・保険', description: '主治医、病院、ペット保険' },
  { id: 'food', title: 'ごはん', description: 'いつものフード、好み、アレルギー' },
  { id: 'care_notes', title: 'お世話・注意事項', description: '性格、留守中、家族への申し送り' },
  { id: 'anniversary_notifications', title: '記念日・通知', description: '誕生日、記念日、予定通知' },
];

export function AdditionalInfoCategoryScreen({
  navigation,
  route,
}: Props<'AdditionalInfoCategory'>) {
  const { completeOnboarding } = useAppStore();
  const [selected, setSelected] = useState<AdditionalInfoCategory>('medical_prevention');
  return (
    <Screen>
      <Title subtitle="必要な項目だけ入力できます。あとからいつでも追加・変更できます。">
        詳しい情報を追加しましょう
      </Title>
      {categories.map((category) => (
        <Card
          key={category.id}
          style={selected === category.id ? styles.selectedCard : undefined}
        >
          <Text style={styles.feature} onPress={() => setSelected(category.id)}>
            {category.title}
          </Text>
          <Text style={styles.helper} onPress={() => setSelected(category.id)}>
            {category.description}
          </Text>
        </Card>
      ))}
      <Button
        title="この項目を入力する"
        onPress={() =>
          navigation.navigate('AdditionalInfoInput', {
            catId: route.params.catId,
            categoryId: selected,
          })
        }
      />
      <Button title="完了してホームへ" variant="secondary" onPress={completeOnboarding} />
    </Screen>
  );
}

const categoryFields: Record<AdditionalInfoCategory, Array<{ key: string; label: string }>> = {
  medical_prevention: [
    { key: 'latestVaccineDate', label: 'ワクチン接種日' },
    { key: 'nextVaccineDate', label: '次回ワクチン予定日' },
    { key: 'latestDewormingDate', label: '駆虫薬投与日' },
    { key: 'nextDewormingDate', label: '次回駆虫薬予定日' },
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
    { key: 'medicationNote', label: '投薬メモ' },
    { key: 'personality', label: '性格' },
    { key: 'dislikes', label: '苦手なこと' },
    { key: 'awayCareNote', label: '留守中の注意' },
    { key: 'familyNote', label: '家族への申し送り' },
  ],
  anniversary_notifications: [],
};

export function AdditionalInfoInputScreen({
  navigation,
  route,
}: Props<'AdditionalInfoInput'>) {
  const { profiles, updateProfiles, completeOnboarding } = useAppStore();
  const [values, setValues] = useState<Record<string, string>>({});
  const fields = categoryFields[route.params.categoryId];
  const title = useMemo(
    () => categories.find((item) => item.id === route.params.categoryId)?.title ?? '詳しい情報',
    [route.params.categoryId],
  );
  const save = () => {
    if (route.params.categoryId === 'anniversary_notifications') {
      navigation.goBack();
      return;
    }
    const now = new Date().toISOString();
    const profileKey =
      route.params.categoryId === 'medical_prevention'
        ? 'medical'
        : route.params.categoryId === 'hospital_insurance'
          ? 'medical'
          : route.params.categoryId === 'food'
            ? 'food'
            : 'care';
    let next: Profiles = profiles;
    if (route.params.categoryId === 'hospital_insurance') {
      const medicalValues = Object.fromEntries(
        Object.entries(values).filter(([key]) => key.startsWith('primary') || key.startsWith('hospital')),
      );
      const insuranceValues = Object.fromEntries(
        Object.entries(values).filter(([key]) => key.startsWith('insurance')),
      );
      next = {
        ...profiles,
        medical: upsertProfile(profiles.medical, route.params.catId, medicalValues, now),
        insurance: upsertProfile(profiles.insurance, route.params.catId, insuranceValues, now),
      };
    } else {
      next = {
        ...profiles,
        [profileKey]: upsertProfile(profiles[profileKey], route.params.catId, values, now),
      };
    }
    updateProfiles(next);
    navigation.goBack();
  };
  return (
    <Screen>
      <Title subtitle="わかる項目だけ入力してください。">{title}</Title>
      {fields.length ? (
        fields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            value={values[field.key] ?? ''}
            onChangeText={(text) => setValues((current) => ({ ...current, [field.key]: text }))}
            placeholder={field.key.toLowerCase().includes('date') ? 'YYYY-MM-DD' : ''}
            multiline={field.key.toLowerCase().includes('note')}
          />
        ))
      ) : (
        <Card>
          <Text style={styles.feature}>通知は初期設定で有効です</Text>
          <Text style={styles.helper}>設定タブからカテゴリごとに変更できます。</Text>
        </Card>
      )}
      <Button title="保存する" onPress={save} />
      <Button title="スキップ" variant="ghost" onPress={() => navigation.goBack()} />
      <Button title="完了してホームへ" variant="secondary" onPress={completeOnboarding} />
    </Screen>
  );
}

function upsertProfile<T extends { id: string; catId: string; createdAt: string; updatedAt: string }>(
  list: T[],
  catId: string,
  values: Record<string, string>,
  timestamp: string,
): T[] {
  const existing = list.find((item) => item.catId === catId);
  if (existing) {
    return list.map((item) =>
      item.catId === catId ? ({ ...item, ...values, updatedAt: timestamp } as T) : item,
    );
  }
  return [
    ...list,
    {
      id: `profile-${Date.now()}`,
      catId,
      ...values,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as T,
  ];
}

const styles = StyleSheet.create({
  splash: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  logo: { height: 180, resizeMode: 'contain', width: 180 },
  welcomeLogo: { alignSelf: 'center', height: 120, resizeMode: 'contain', width: 120 },
  brand: { color: colors.text, fontSize: 34, fontWeight: '800', marginTop: 16 },
  catchcopy: { color: colors.muted, marginTop: 12, textAlign: 'center' },
  centered: { justifyContent: 'center' },
  feature: { color: colors.text, fontSize: 16, fontWeight: '700' },
  helper: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700' },
  photoCard: { alignItems: 'center' },
  photoPlaceholder: { height: 96, resizeMode: 'contain', width: 96 },
  selectedCard: { backgroundColor: colors.tint, borderColor: colors.primary },
});
