import { useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { catRoutes } from '@/navigation/routes';
import { CatStackParamList } from '@/navigation/types';
import { addCat, updateCatProfile, useAppStore } from '@/store/useAppStore';
import {
  AdoptionDateType,
  BirthDateType,
  BreedType,
  Cat,
  CatCareProfile,
  CatFoodProfile,
  CatInsuranceProfile,
  CatMedicalProfile,
  CatRecord,
  CatSchedule,
  CatSex,
  RecordType,
} from '@/types/models';
import { daysUntil } from '@/utils/date';

type CatStackProps<RouteName extends keyof CatStackParamList> = NativeStackScreenProps<
  CatStackParamList,
  RouteName
>;

type TabId = 'overview' | 'medical' | 'food' | 'timeline' | 'insurance' | 'memo';

const tabItems: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: '概要' },
  { id: 'medical', label: '医療' },
  { id: 'food', label: 'ごはん' },
  { id: 'timeline', label: '履歴' },
  { id: 'insurance', label: '保険' },
  { id: 'memo', label: 'メモ' },
];

const recordTypes: Array<{ label: string; type: RecordType }> = [
  { label: '体重', type: 'weight' },
  { label: '通院', type: 'hospital_visit' },
  { label: '投薬', type: 'medication' },
  { label: 'フード', type: 'food' },
  { label: '体調', type: 'health_condition' },
  { label: '保険', type: 'insurance' },
  { label: 'メモ', type: 'memo' },
];

const catSexLabels: Record<CatSex, string> = {
  male: 'オス',
  female: 'メス',
  unknown: '不明',
};

const recordTypeLabels: Record<RecordType, string> = {
  weight: '体重',
  hospital_visit: '通院',
  vaccine: 'ワクチン',
  deworming: '駆虫',
  medication: '投薬',
  food: 'フード',
  health_condition: '体調',
  care: 'ケア',
  insurance: '保険',
  memo: 'メモ',
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
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

function formatDate(value: string | null) {
  return value ?? '未登録';
}

function getNextPlan(schedules: CatSchedule[], catId: string) {
  const today = new Date(`${todayString()}T00:00:00`);

  return schedules
    .filter((schedule) => schedule.catId === catId && schedule.status === 'scheduled')
    .map((schedule) => ({
      ...schedule,
      daysUntil: daysUntil(new Date(`${schedule.dueDate}T00:00:00`), today),
    }))
    .filter((schedule) => schedule.daysUntil >= 0)
    .sort((left, right) => left.daysUntil - right.daysUntil)[0];
}

function getPendingTaskCount(
  tasks: ReturnType<typeof useAppStore.getState>['tasks'],
  catId: string,
) {
  return tasks.filter((task) => task.catId === catId && task.status === 'pending').length;
}

function findByCatId<T extends { catId: string }>(items: T[], catId: string) {
  return items.find((item) => item.catId === catId) ?? null;
}

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

function Avatar({ name, size = 'normal' }: { name: string; size?: 'normal' | 'large' }) {
  return (
    <View style={[styles.avatar, size === 'large' ? styles.avatarLarge : null]}>
      <Text style={styles.avatarText}>{name.slice(0, 1)}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {value === null || value === undefined || value === '' ? '未登録' : value}
      </Text>
    </View>
  );
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <Card>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.bodyText}>{text}</Text>
    </Card>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
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

export function CatListScreen({ navigation }: CatStackProps<typeof catRoutes.list>) {
  const [query, setQuery] = useState('');
  const cats = useAppStore((state) => state.cats);
  const schedules = useAppStore((state) => state.schedules);
  const tasks = useAppStore((state) => state.tasks);

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
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ねこ一覧</Text>
            <Text style={styles.count}>{cats.length}匹のねこ</Text>
          </View>
          <AppButton
            label="+ 追加"
            variant="secondary"
            onPress={() => navigation.navigate(catRoutes.create)}
          />
        </View>

        <TextInput
          onChangeText={setQuery}
          placeholder="名前で検索"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          value={query}
        />

        {cats.length === 0 ? (
          <Card>
            <Text style={styles.cardTitle}>猫ちゃんを登録しましょう</Text>
            <Text style={styles.bodyText}>
              ねこれこは、猫ごとの情報をひとりずつ大切に記録できます。
            </Text>
            <View style={styles.sectionAction}>
              <AppButton
                label="猫ちゃんを追加する"
                onPress={() => navigation.navigate(catRoutes.create)}
              />
            </View>
          </Card>
        ) : filteredCats.length === 0 ? (
          <EmptyCard title="該当する猫がいません" text="検索条件を変えてもう一度お試しください。" />
        ) : (
          <View style={styles.grid}>
            {filteredCats.map((cat) => {
              const taskCount = getPendingTaskCount(tasks, cat.id);
              const nextPlan = getNextPlan(schedules, cat.id);

              return (
                <Pressable
                  accessibilityRole="button"
                  key={cat.id}
                  onPress={() => navigation.navigate(catRoutes.detail, { catId: cat.id })}
                  style={({ pressed }) => [
                    styles.catCard,
                    taskCount > 0 ? styles.catCardWarning : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Avatar name={cat.name} size="large" />
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catMeta}>
                    {calculateAge(cat)} / {catSexLabels[cat.sex]}
                  </Text>
                  <Text style={styles.catMeta}>{cat.coatColorPattern ?? '毛色・柄未登録'}</Text>
                  <Text style={styles.catPlan}>
                    {nextPlan ? `${nextPlan.title}: ${nextPlan.daysUntil}日後` : '近日予定なし'}
                  </Text>
                  {taskCount > 0 ? (
                    <Text style={styles.warningText}>未完了 {taskCount}件</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

export function CatDetailScreen({ navigation, route }: CatStackProps<typeof catRoutes.detail>) {
  const catId = route.params?.catId;
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const cats = useAppStore((state) => state.cats);
  const medicalProfiles = useAppStore((state) => state.medicalProfiles);
  const foodProfiles = useAppStore((state) => state.foodProfiles);
  const insuranceProfiles = useAppStore((state) => state.insuranceProfiles);
  const careProfiles = useAppStore((state) => state.careProfiles);
  const records = useAppStore((state) => state.records);
  const schedules = useAppStore((state) => state.schedules);
  const tasks = useAppStore((state) => state.tasks);

  const cat = cats.find((item) => item.id === catId);

  if (!cat) {
    return (
      <ScreenShell>
        <ScrollView contentContainerStyle={styles.container}>
          <EmptyCard
            title="猫情報が見つかりません"
            text="一覧に戻って、もう一度選択してください。"
          />
          <AppButton label="ねこ一覧へ" onPress={() => navigation.navigate(catRoutes.list)} />
        </ScrollView>
      </ScreenShell>
    );
  }

  const medicalProfile = findByCatId(medicalProfiles, cat.id);
  const foodProfile = findByCatId(foodProfiles, cat.id);
  const insuranceProfile = findByCatId(insuranceProfiles, cat.id);
  const careProfile = findByCatId(careProfiles, cat.id);
  const catRecords = records
    .filter((record) => record.catId === cat.id)
    .sort((left, right) => right.recordDate.localeCompare(left.recordDate));
  const catSchedules = schedules.filter((schedule) => schedule.catId === cat.id);
  const nextPlan = getNextPlan(schedules, cat.id);
  const taskCount = getPendingTaskCount(tasks, cat.id);
  const selectedCatId = cat.id;

  function openRecordInput(recordType: RecordType) {
    setIsQuickAddOpen(false);
    navigation.navigate(catRoutes.recordInput, { catId: selectedCatId, recordType });
  }

  return (
    <ScreenShell>
      <View style={styles.detailScreen}>
        <ScrollView contentContainerStyle={styles.container}>
          <Card>
            <View style={styles.profileHeader}>
              <Avatar name={cat.name} size="large" />
              <View style={styles.flex}>
                <Text style={styles.title}>{cat.name}</Text>
                <Text style={styles.mutedText}>
                  {calculateAge(cat)} / {catSexLabels[cat.sex]}
                </Text>
                <Text style={styles.mutedText}>{cat.coatColorPattern ?? '毛色・柄未登録'}</Text>
              </View>
              {taskCount > 0 ? <Text style={styles.badge}>注意 {taskCount}</Text> : null}
            </View>

            <View style={styles.profileFacts}>
              <InfoRow label="うちの子記念日" value={formatDate(cat.adoptionDate)} />
              <InfoRow
                label="次の予定"
                value={nextPlan ? `${nextPlan.title} (${nextPlan.daysUntil}日後)` : '近日予定なし'}
              />
            </View>

            <View style={styles.rowActions}>
              <AppButton
                label="編集"
                onPress={() => navigation.navigate(catRoutes.profileEdit, { catId: cat.id })}
              />
              <AppButton
                label="共有"
                variant="secondary"
                onPress={() => navigation.navigate(catRoutes.sharePreview, { catId: cat.id })}
              />
            </View>
          </Card>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabRow}>
              {tabItems.map((tab) => {
                const selected = tab.id === activeTab;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={[styles.tab, selected ? styles.tabSelected : null]}
                  >
                    <Text style={[styles.tabLabel, selected ? styles.tabLabelSelected : null]}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <CatDetailTabContent
            activeTab={activeTab}
            cat={cat}
            careProfile={careProfile}
            foodProfile={foodProfile}
            insuranceProfile={insuranceProfile}
            medicalProfile={medicalProfile}
            records={catRecords}
            schedules={catSchedules}
            onAddRecord={openRecordInput}
          />
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={() => setIsQuickAddOpen(true)}
          style={({ pressed }) => [styles.fab, pressed ? styles.pressed : null]}
        >
          <Text style={styles.fabLabel}>+ この子の記録を追加</Text>
        </Pressable>
      </View>

      <RecordQuickAddSheet
        isVisible={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelect={openRecordInput}
      />
    </ScreenShell>
  );
}

function CatDetailTabContent({
  activeTab,
  cat,
  medicalProfile,
  foodProfile,
  insuranceProfile,
  careProfile,
  records,
  schedules,
  onAddRecord,
}: {
  activeTab: TabId;
  cat: Cat;
  medicalProfile: CatMedicalProfile | null;
  foodProfile: CatFoodProfile | null;
  insuranceProfile: CatInsuranceProfile | null;
  careProfile: CatCareProfile | null;
  records: CatRecord[];
  schedules: CatSchedule[];
  onAddRecord: (recordType: RecordType) => void;
}) {
  if (activeTab === 'overview') {
    return (
      <View style={styles.section}>
        <Card>
          <Text style={styles.cardTitle}>基本プロフィール</Text>
          <InfoRow label="名前" value={cat.name} />
          <InfoRow label="生年月日" value={formatDate(cat.birthDate)} />
          <InfoRow
            label="猫種・血統"
            value={cat.breed ?? (cat.breedType === 'mixed' ? '雑種' : null)}
          />
          <InfoRow label="性格" value={careProfile?.personality} />
          <InfoRow label="家族への申し送り" value={careProfile?.familyNote} />
          <InfoRow label="かかりつけ" value={medicalProfile?.primaryHospitalName} />
        </Card>
        <Card>
          <Text style={styles.cardTitle}>よく使う操作</Text>
          <View style={styles.quickActionGrid}>
            <AppButton label="体重を記録" onPress={() => onAddRecord('weight')} />
            <AppButton label="通院を記録" onPress={() => onAddRecord('hospital_visit')} />
            <AppButton label="フードを記録" onPress={() => onAddRecord('food')} />
            <AppButton label="メモを追加" onPress={() => onAddRecord('memo')} />
          </View>
        </Card>
      </View>
    );
  }

  if (activeTab === 'medical') {
    return (
      <Card>
        <Text style={styles.cardTitle}>医療・予防</Text>
        <InfoRow label="避妊去勢" value={medicalProfile?.sterilizationStatus} />
        <InfoRow label="かかりつけ病院" value={medicalProfile?.primaryHospitalName} />
        <InfoRow label="主治医" value={medicalProfile?.primaryDoctorName} />
        <InfoRow label="次回ワクチン" value={medicalProfile?.nextVaccineDate} />
        <InfoRow label="次回駆虫" value={medicalProfile?.nextDewormingDate} />
        <InfoRow label="医療メモ" value={medicalProfile?.medicalNote} />
        <View style={styles.listBlock}>
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <Text key={schedule.id} style={styles.listText}>
                {schedule.dueDate} / {schedule.title}
              </Text>
            ))
          ) : (
            <Text style={styles.mutedText}>予定は未登録です。</Text>
          )}
        </View>
      </Card>
    );
  }

  if (activeTab === 'food') {
    const foodRecords = records.filter((record) => record.type === 'food');
    return (
      <Card>
        <Text style={styles.cardTitle}>ごはん</Text>
        <InfoRow label="いつものフード" value={foodProfile?.regularFood} />
        <InfoRow label="好きなごはん" value={foodProfile?.favoriteFood} />
        <InfoRow label="苦手なごはん" value={foodProfile?.dislikedFood} />
        <InfoRow label="アレルギー" value={foodProfile?.foodAllergies} />
        <InfoRow label="食事メモ" value={foodProfile?.foodNote} />
        <View style={styles.listBlock}>
          {foodRecords.length > 0 ? (
            foodRecords.map((record) => (
              <Text key={record.id} style={styles.listText}>
                {record.recordDate} / {record.foodName}
              </Text>
            ))
          ) : (
            <Text style={styles.mutedText}>フード記録はまだありません。</Text>
          )}
        </View>
      </Card>
    );
  }

  if (activeTab === 'timeline') {
    return (
      <View style={styles.section}>
        {records.length > 0 ? (
          records.map((record) => (
            <Card key={record.id}>
              <Text style={styles.cardTitle}>
                {record.recordDate} / {recordTypeLabels[record.type]}
              </Text>
              <Text style={styles.bodyText}>{describeRecord(record)}</Text>
            </Card>
          ))
        ) : (
          <EmptyCard
            title="履歴はまだありません"
            text="この子の記録を追加すると、ここに表示されます。"
          />
        )}
      </View>
    );
  }

  if (activeTab === 'insurance') {
    const insuranceRecords = records.filter((record) => record.type === 'insurance');
    return (
      <Card>
        <Text style={styles.cardTitle}>保険</Text>
        <InfoRow label="加入保険" value={insuranceProfile?.insuranceName} />
        <InfoRow label="プラン" value={insuranceProfile?.insurancePlan} />
        <InfoRow label="証券番号" value={insuranceProfile?.insurancePolicyNumber} />
        <InfoRow label="保険メモ" value={insuranceProfile?.insuranceNote} />
        <View style={styles.listBlock}>
          {insuranceRecords.length > 0 ? (
            insuranceRecords.map((record) => (
              <Text key={record.id} style={styles.listText}>
                {record.recordDate} / {record.hospitalName} / {record.claimStatus}
              </Text>
            ))
          ) : (
            <Text style={styles.mutedText}>保険請求履歴はまだありません。</Text>
          )}
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.cardTitle}>メモ</Text>
      <InfoRow label="性格" value={careProfile?.personality} />
      <InfoRow label="苦手なこと" value={careProfile?.dislikes} />
      <InfoRow label="留守中の注意" value={careProfile?.awayCareNote} />
      <InfoRow label="家族への申し送り" value={careProfile?.familyNote} />
      <InfoRow label="投薬メモ" value={careProfile?.medicationNote} />
      <View style={styles.listBlock}>
        {records
          .filter((record) => record.type === 'memo')
          .map((record) => (
            <Text key={record.id} style={styles.listText}>
              {record.recordDate} / {record.title}
            </Text>
          ))}
      </View>
    </Card>
  );
}

function describeRecord(record: CatRecord) {
  if (record.type === 'weight') {
    return `${record.weightKg}kg${record.memo ? ` / ${record.memo}` : ''}`;
  }

  if (record.type === 'hospital_visit') {
    return `${record.hospitalName} / ${record.summary}`;
  }

  if (record.type === 'food') {
    return `${record.foodName} / ${record.status}`;
  }

  if (record.type === 'insurance') {
    return `${record.hospitalName} / ${record.amountYen}円 / ${record.claimStatus}`;
  }

  if (record.type === 'memo') {
    return `${record.title} / ${record.body}`;
  }

  if (record.type === 'medication') {
    return `${record.medicineName} / ${record.timing}`;
  }

  if (record.type === 'health_condition') {
    return `${record.category} / ${record.status}`;
  }

  return '';
}

function RecordQuickAddSheet({
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

function CatProfileForm({
  initialCat,
  submitLabel,
  onSubmit,
}: {
  initialCat?: Cat;
  submitLabel: string;
  onSubmit: (input: {
    name: string;
    photoUrl: string | null;
    sex: CatSex;
    birthDate: string | null;
    birthDateType: BirthDateType;
    adoptionDate: string | null;
    adoptionDateType: AdoptionDateType;
    breed: string | null;
    breedType: BreedType;
    coatColorPattern: string | null;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(initialCat?.name ?? '');
  const [photoUrl, setPhotoUrl] = useState(initialCat?.photoUrl ?? '');
  const [sex, setSex] = useState<CatSex>(initialCat?.sex ?? 'unknown');
  const [birthDateType, setBirthDateType] = useState<BirthDateType>(
    initialCat?.birthDateType ?? 'unknown',
  );
  const [birthDate, setBirthDate] = useState(initialCat?.birthDate ?? '');
  const [adoptionDateType, setAdoptionDateType] = useState<AdoptionDateType>(
    initialCat?.adoptionDateType ?? 'unknown',
  );
  const [adoptionDate, setAdoptionDate] = useState(initialCat?.adoptionDate ?? '');
  const [breedType, setBreedType] = useState<BreedType>(initialCat?.breedType ?? 'unknown');
  const [breed, setBreed] = useState(initialCat?.breed ?? '');
  const [coatColorPattern, setCoatColorPattern] = useState(initialCat?.coatColorPattern ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

    if (birthDateType !== 'unknown' && (!isValidDate(birthDate) || birthDate > today)) {
      setError('生年月日は YYYY-MM-DD 形式で、未来日以外を入力してください。');
      return;
    }

    if (adoptionDateType === 'exact' && (!isValidDate(adoptionDate) || adoptionDate > today)) {
      setError('うちの子記念日は YYYY-MM-DD 形式で、未来日以外を入力してください。');
      return;
    }

    try {
      setIsSaving(true);
      await onSubmit({
        name: trimmedName,
        photoUrl: photoUrl.trim() || null,
        sex,
        birthDate: birthDateType === 'unknown' ? null : birthDate,
        birthDateType,
        adoptionDate: adoptionDateType === 'exact' ? adoptionDate : null,
        adoptionDateType,
        breed:
          breedType === 'mixed' ? '雑種' : breedType === 'purebred' ? breed.trim() || null : null,
        breedType,
        coatColorPattern: coatColorPattern.trim() || null,
      });
    } catch {
      setError('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <View style={styles.form}>
        <Field label="名前" onChangeText={setName} placeholder="りお" value={name} />
        <Field label="写真" onChangeText={setPhotoUrl} placeholder="画像URLなど" value={photoUrl} />
        <OptionGroup
          label="性別"
          onChange={setSex}
          options={[
            { label: 'オス', value: 'male' },
            { label: 'メス', value: 'female' },
            { label: '不明', value: 'unknown' },
          ]}
          value={sex}
        />
        <OptionGroup
          label="生年月日の状態"
          onChange={setBirthDateType}
          options={[
            { label: '正確', value: 'exact' },
            { label: '推定', value: 'estimated' },
            { label: '不明', value: 'unknown' },
          ]}
          value={birthDateType}
        />
        {birthDateType !== 'unknown' ? (
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
          options={[
            { label: '日付あり', value: 'exact' },
            { label: 'あとで', value: 'unknown' },
          ]}
          value={adoptionDateType}
        />
        {adoptionDateType === 'exact' ? (
          <Field
            label="うちの子記念日"
            onChangeText={setAdoptionDate}
            placeholder="YYYY-MM-DD"
            value={adoptionDate}
          />
        ) : null}
        <OptionGroup
          label="猫種・血統の状態"
          onChange={setBreedType}
          options={[
            { label: '入力する', value: 'purebred' },
            { label: '雑種', value: 'mixed' },
            { label: '不明', value: 'unknown' },
          ]}
          value={breedType}
        />
        {breedType === 'purebred' ? (
          <Field
            label="猫種・血統"
            onChangeText={setBreed}
            placeholder="スコティッシュ、ラグドールなど"
            value={breed}
          />
        ) : null}
        <Field
          label="毛色・柄"
          onChangeText={setCoatColorPattern}
          placeholder="キジ白、三毛など"
          value={coatColorPattern}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <AppButton
          disabled={isSaving}
          label={isSaving ? '保存中...' : submitLabel}
          onPress={handleSubmit}
        />
      </View>
    </Card>
  );
}

export function CatCreateScreen({ navigation }: CatStackProps<typeof catRoutes.create>) {
  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>猫ちゃんを追加</Text>
          <Text style={styles.bodyText}>複数の猫を、1匹ずつ基本プロフィールで登録できます。</Text>
        </View>
        <CatProfileForm
          submitLabel="登録する"
          onSubmit={async (input) => {
            const cat = await addCat(input);
            navigation.replace(catRoutes.detail, { catId: cat.id });
          }}
        />
      </ScrollView>
    </ScreenShell>
  );
}

export function CatProfileEditScreen({
  navigation,
  route,
}: CatStackProps<typeof catRoutes.profileEdit>) {
  const catId = route.params?.catId;
  const cat = useAppStore((state) => state.cats.find((item) => item.id === catId));

  if (!cat) {
    return (
      <ScreenShell>
        <ScrollView contentContainerStyle={styles.container}>
          <EmptyCard
            title="猫情報が見つかりません"
            text="一覧に戻って、もう一度選択してください。"
          />
          <AppButton label="ねこ一覧へ" onPress={() => navigation.navigate(catRoutes.list)} />
        </ScrollView>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>プロフィール編集</Text>
          <Text style={styles.bodyText}>Cat には基本プロフィールのみ保存します。</Text>
        </View>
        <CatProfileForm
          initialCat={cat}
          submitLabel="保存する"
          onSubmit={async (input) => {
            await updateCatProfile(cat.id, input);
            navigation.replace(catRoutes.detail, { catId: cat.id });
          }}
        />
      </ScrollView>
    </ScreenShell>
  );
}

export function SharePreviewScreen({ route }: CatStackProps<typeof catRoutes.sharePreview>) {
  const catId = route.params?.catId;
  const cat = useAppStore((state) => state.cats.find((item) => item.id === catId));

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <Text style={styles.cardTitle}>家族共有は近日公開</Text>
          <Text style={styles.bodyText}>
            {cat
              ? `${cat.name}の情報を家族と共有する導線です。`
              : '猫情報を家族と共有する導線です。'}
            MVPでは招待や同期は行わず、今後の共有機能への入口として表示しています。
          </Text>
        </Card>
      </ScrollView>
    </ScreenShell>
  );
}

export function CatRecordInputPlaceholderScreen({
  route,
}: CatStackProps<typeof catRoutes.recordInput>) {
  const { catId, recordType } = route.params ?? {};
  const cat = useAppStore((state) => state.cats.find((item) => item.id === catId));

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <Text style={styles.cardTitle}>この子の記録入力</Text>
          <Text style={styles.bodyText}>
            {cat
              ? `${cat.name}の${recordType ? recordTypeLabels[recordType as RecordType] : ''}記録を追加する仮画面です。`
              : '対象猫を固定した記録入力の仮画面です。'}
            猫詳細からの導線では猫選択をスキップします。
          </Text>
        </Card>
      </ScrollView>
    </ScreenShell>
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
    paddingBottom: 112,
  },
  detailScreen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
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
  searchInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  catCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 210,
    padding: spacing.md,
    width: '48%',
  },
  catCardWarning: {
    borderColor: colors.warning,
  },
  catName: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  catMeta: {
    color: colors.text,
    fontSize: typography.caption,
    lineHeight: 19,
  },
  catPlan: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
    lineHeight: 19,
  },
  profileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  profileFacts: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  flex: {
    flex: 1,
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
  mutedText: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
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
  warningText: {
    color: colors.warning,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionAction: {
    marginTop: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
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
    marginTop: spacing.sm,
  },
  infoRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  infoValue: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  tab: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  tabSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  tabLabelSelected: {
    color: colors.onPrimary,
  },
  quickActionGrid: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  listBlock: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  listText: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
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
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  form: {
    gap: spacing.md,
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
  errorText: {
    color: colors.warning,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
