# ねこレコ データモデル統合仕様

## 目的

このドキュメントは、ねこレコ全体で使用するデータモデルを統合し、Codex で実装しやすい形に整理するための仕様書です。

これまでの仕様書では、オンボーディング、ホーム画面、猫一覧・猫詳細、記録追加、通知・リマインダーごとにデータモデル案を定義していました。  
このファイルでは、それらを共通モデルとして統合し、画面ごとの型の重複やフィールド名のズレを防ぎます。

---

## 基本方針

- `Cat` は猫の基本プロフィールのみを持つ
- 医療、フード、保険、お世話情報はプロフィール系モデルに分ける
- 日付つきの出来事はすべて `CatRecord` 系として扱う
- ホームのタスク、近日予定、通知は概念として分ける
- プロフィールは「現在の状態」、レコードは「過去の履歴」として管理する
- MVPでは家族共有は本格実装しないが、将来拡張できるように型を用意する

---

# 1. 共通型

```ts
type ID = string
type DateString = string // YYYY-MM-DD
type DateTimeString = string // ISO 8601
```

```ts
type AuditFields = {
  createdAt: DateTimeString
  updatedAt: DateTimeString
}
```

```ts
type Nullable<T> = T | null
```

---

# 2. Enum / Union Types

## CatSex

```ts
type CatSex = 'male' | 'female' | 'unknown'
```

表示文言：

| value | 表示 |
|---|---|
| `male` | オス |
| `female` | メス |
| `unknown` | 不明 |

---

## BirthDateType

```ts
type BirthDateType = 'exact' | 'estimated' | 'unknown'
```

| value | 表示 |
|---|---|
| `exact` | 正確な日付 |
| `estimated` | 推定 |
| `unknown` | 不明 |

---

## AdoptionDateType

```ts
type AdoptionDateType = 'exact' | 'unknown'
```

| value | 表示 |
|---|---|
| `exact` | 日付を入力する |
| `unknown` | 不明 / あとで入力 |

---

## BreedType

```ts
type BreedType = 'purebred' | 'mixed' | 'unknown'
```

| value | 表示 |
|---|---|
| `purebred` | 血統・猫種を入力する |
| `mixed` | 雑種 |
| `unknown` | 不明 |

---

## RecordType

```ts
type RecordType =
  | 'weight'
  | 'hospital_visit'
  | 'vaccine'
  | 'deworming'
  | 'medication'
  | 'food'
  | 'health_condition'
  | 'care'
  | 'insurance'
  | 'memo'
```

---

## FoodStatus

```ts
type FoodStatus =
  | 'favorite'
  | 'ate'
  | 'ate_a_little'
  | 'did_not_eat'
  | 'got_bored'
  | 'not_suitable'
```

| value | 表示 |
|---|---|
| `favorite` | よく食べる |
| `ate` | 食べた |
| `ate_a_little` | 少し食べた |
| `did_not_eat` | 食べなかった |
| `got_bored` | 飽きた |
| `not_suitable` | 体調に合わなかった |

---

## InsuranceClaimStatus

```ts
type InsuranceClaimStatus =
  | 'unclaimed'
  | 'preparing'
  | 'claimed'
  | 'paid'
  | 'not_applicable'
```

| value | 表示 |
|---|---|
| `unclaimed` | 未請求 |
| `preparing` | 請求準備中 |
| `claimed` | 請求済み |
| `paid` | 入金済み |
| `not_applicable` | 対象外 |

---

## MemoCategory

```ts
type MemoCategory =
  | 'personality'
  | 'care'
  | 'away'
  | 'hospital'
  | 'family'
  | 'other'
```

| value | 表示 |
|---|---|
| `personality` | 性格 |
| `care` | お世話 |
| `away` | 留守中 |
| `hospital` | 病院 |
| `family` | 家族への申し送り |
| `other` | その他 |

---

## MedicationTiming

```ts
type MedicationTiming =
  | 'morning'
  | 'noon'
  | 'night'
  | 'before_sleep'
  | 'other'
```

| value | 表示 |
|---|---|
| `morning` | 朝 |
| `noon` | 昼 |
| `night` | 夜 |
| `before_sleep` | 寝る前 |
| `other` | その他 |

---

## HealthCategory

```ts
type HealthCategory =
  | 'appetite'
  | 'vomiting'
  | 'diarrhea'
  | 'excretion'
  | 'drinking'
  | 'energy'
  | 'other'
```

| value | 表示 |
|---|---|
| `appetite` | 食欲 |
| `vomiting` | 嘔吐 |
| `diarrhea` | 下痢・軟便 |
| `excretion` | 排泄 |
| `drinking` | 飲水 |
| `energy` | 元気 |
| `other` | その他 |

---

## ConditionStatus

```ts
type ConditionStatus =
  | 'good'
  | 'normal'
  | 'concern'
  | 'bad'
```

| value | 表示 |
|---|---|
| `good` | 良い |
| `normal` | 普通 |
| `concern` | 気になる |
| `bad` | 悪い |

---

## SterilizationStatus

```ts
type SterilizationStatus = 'done' | 'not_done' | 'unknown'
```

| value | 表示 |
|---|---|
| `done` | 済み |
| `not_done` | 未 |
| `unknown` | 不明 |

---

## ReminderType

```ts
type ReminderType =
  | 'vaccine'
  | 'deworming'
  | 'hospital_visit'
  | 'medication'
  | 'birthday'
  | 'adoption_anniversary'
  | 'insurance_claim'
  | 'weight_record'
  | 'care'
```

---

## ReminderTiming

```ts
type ReminderTiming =
  | 'seven_days_before'
  | 'three_days_before'
  | 'one_day_before'
  | 'on_the_day'
  | 'custom'
```

---

## ReminderStatus

```ts
type ReminderStatus =
  | 'scheduled'
  | 'sent'
  | 'cancelled'
  | 'completed'
```

---

## TaskStatus

```ts
type TaskStatus =
  | 'pending'
  | 'completed'
  | 'snoozed'
```

---

# 3. Core Models

## Cat

猫の基本プロフィール。  
一覧、オンボーディング、詳細画面のヘッダーで使用する。

```ts
type Cat = AuditFields & {
  id: ID
  name: string
  photoUrl?: Nullable<string>

  sex: CatSex

  birthDate?: Nullable<DateString>
  birthDateType: BirthDateType

  adoptionDate?: Nullable<DateString>
  adoptionDateType: AdoptionDateType

  breed?: Nullable<string>
  breedType: BreedType

  coatColorPattern?: Nullable<string>

  isArchived?: boolean
}
```

---

## CatMedicalProfile

現在の医療プロフィール。  
病歴、主治医、避妊去勢など「現在の状態」を持つ。

```ts
type CatMedicalProfile = AuditFields & {
  id: ID
  catId: ID

  primaryHospitalName?: Nullable<string>
  primaryDoctorName?: Nullable<string>
  hospitalPhoneNumber?: Nullable<string>

  medicalHistory?: Nullable<string>
  sterilizationStatus?: SterilizationStatus

  latestVaccineDate?: Nullable<DateString>
  nextVaccineDate?: Nullable<DateString>

  latestDewormingDate?: Nullable<DateString>
  nextDewormingDate?: Nullable<DateString>

  latestHospitalVisitDate?: Nullable<DateString>
  nextHospitalVisitDate?: Nullable<DateString>

  medicalNote?: Nullable<string>
}
```

---

## CatFoodProfile

現在のフード・アレルギー情報。

```ts
type CatFoodProfile = AuditFields & {
  id: ID
  catId: ID

  regularFood?: Nullable<string>
  favoriteFood?: Nullable<string>
  dislikedFood?: Nullable<string>
  foodAllergies?: Nullable<string>
  foodNote?: Nullable<string>
}
```

---

## CatInsuranceProfile

現在加入しているペット保険情報。

```ts
type CatInsuranceProfile = AuditFields & {
  id: ID
  catId: ID

  insuranceName?: Nullable<string>
  insurancePlan?: Nullable<string>
  insurancePolicyNumber?: Nullable<string>
  insuranceNote?: Nullable<string>
}
```

---

## CatCareProfile

性格、注意事項、家族への申し送りなど、お世話に関する現在の情報。

```ts
type CatCareProfile = AuditFields & {
  id: ID
  catId: ID

  personality?: Nullable<string>
  likes?: Nullable<string>
  dislikes?: Nullable<string>
  careNotes?: Nullable<string>
  awayCareNote?: Nullable<string>
  familyNote?: Nullable<string>

  hasMedication?: boolean
  medicationNote?: Nullable<string>
}
```

---

# 4. Record Models

## BaseRecord

すべての日付つき記録の基底モデル。

```ts
type BaseRecord = AuditFields & {
  id: ID
  catId: ID
  recordType: RecordType
  recordedAt: DateTimeString
  note?: Nullable<string>
}
```

---

## WeightRecord

```ts
type WeightRecord = BaseRecord & {
  recordType: 'weight'
  weightKg: number
}
```

---

## HospitalVisitRecord

```ts
type HospitalVisitRecord = BaseRecord & {
  recordType: 'hospital_visit'

  visitedAt: DateString
  hospitalName?: Nullable<string>
  doctorName?: Nullable<string>
  visitNote?: Nullable<string>

  diagnosisName?: Nullable<string>
  prescribedMedication?: Nullable<string>
  inspectionNote?: Nullable<string>

  weightKg?: Nullable<number>
  amount?: Nullable<number>

  nextVisitDate?: Nullable<DateString>

  insuranceClaimStatus?: Nullable<InsuranceClaimStatus>
  receiptPhotoUrl?: Nullable<string>
}
```

---

## VaccineRecord

```ts
type VaccineRecord = BaseRecord & {
  recordType: 'vaccine'

  vaccineDate: DateString
  vaccineName?: Nullable<string>
  nextVaccineDate?: Nullable<DateString>
  hospitalName?: Nullable<string>
}
```

---

## DewormingRecord

```ts
type DewormingRecord = BaseRecord & {
  recordType: 'deworming'

  dewormingDate: DateString
  medicineName?: Nullable<string>
  nextDewormingDate?: Nullable<DateString>
}
```

---

## MedicationRecord

```ts
type MedicationRecord = BaseRecord & {
  recordType: 'medication'

  medicationName: string
  dosage?: Nullable<string>
  timing?: Nullable<MedicationTiming>
  isGiven: boolean
}
```

---

## FoodRecord

```ts
type FoodRecord = BaseRecord & {
  recordType: 'food'

  foodName: string
  brand?: Nullable<string>
  flavor?: Nullable<string>
  shape?: Nullable<string>
  foodStatus: FoodStatus
}
```

---

## HealthConditionRecord

```ts
type HealthConditionRecord = BaseRecord & {
  recordType: 'health_condition'

  healthCategory: HealthCategory
  conditionStatus: ConditionStatus
}
```

---

## CareRecord

```ts
type CareRecord = BaseRecord & {
  recordType: 'care'

  careType:
    | 'nail_cut'
    | 'brushing'
    | 'shampoo'
    | 'ear_cleaning'
    | 'tooth_brushing'
    | 'other'

  careTitle: string
}
```

---

## InsuranceClaimRecord

```ts
type InsuranceClaimRecord = BaseRecord & {
  recordType: 'insurance'

  visitDate?: Nullable<DateString>
  hospitalName?: Nullable<string>
  amount?: Nullable<number>
  diagnosisName?: Nullable<string>
  claimStatus: InsuranceClaimStatus
  receiptPhotoUrl?: Nullable<string>
}
```

---

## MemoRecord

```ts
type MemoRecord = BaseRecord & {
  recordType: 'memo'

  title?: Nullable<string>
  memoCategory: MemoCategory
  body: string
}
```

---

## CatRecord

履歴タブで扱う統合レコード。

```ts
type CatRecord =
  | WeightRecord
  | HospitalVisitRecord
  | VaccineRecord
  | DewormingRecord
  | MedicationRecord
  | FoodRecord
  | HealthConditionRecord
  | CareRecord
  | InsuranceClaimRecord
  | MemoRecord
```

---

# 5. Task / Home Models

## HomeTask

ホームの「今日やること」に表示するタスク。

```ts
type HomeTask = AuditFields & {
  id: ID
  catId: ID

  type: ReminderType
  title: string
  description?: Nullable<string>

  dueDate: DateString
  reminderDate?: Nullable<DateString>

  status: TaskStatus

  sourceType?:
    | 'vaccine'
    | 'deworming'
    | 'hospital_visit'
    | 'medication'
    | 'insurance_claim'
    | 'care'
    | 'anniversary'
    | 'manual'

  sourceId?: Nullable<ID>
}
```

---

## UpcomingPlan

ホームの「近日の予定」に表示する予定。

```ts
type UpcomingPlan = {
  id: ID
  catId: ID
  catName: string
  catPhotoUrl?: Nullable<string>

  type: ReminderType
  title: string
  scheduledDate: DateString
  daysUntil: number

  sourceId?: Nullable<ID>
}
```

---

## InfoCompletionSuggestion

初回登録後などに、追加登録を促すカード用モデル。

```ts
type InfoCompletionSuggestion = {
  id: ID
  catId: ID
  catName: string

  missingFields: Array<
    | 'vaccine'
    | 'deworming'
    | 'hospital'
    | 'insurance'
    | 'food'
    | 'care_notes'
  >

  message: string
  dismissedUntil?: Nullable<DateTimeString>
}
```

---

# 6. Reminder Models

## Reminder

端末通知・予定通知として扱うモデル。

```ts
type Reminder = AuditFields & {
  id: ID
  catId: ID
  reminderType: ReminderType

  title: string
  body: string

  scheduledAt: DateTimeString
  targetDate?: Nullable<DateString>

  status: ReminderStatus

  sourceType:
    | 'vaccine'
    | 'deworming'
    | 'hospital_visit'
    | 'medication'
    | 'birthday'
    | 'adoption_anniversary'
    | 'insurance_claim'
    | 'weight_record'
    | 'care'
    | 'manual'

  sourceId?: Nullable<ID>
}
```

---

## ReminderGlobalSettings

```ts
type ReminderGlobalSettings = AuditFields & {
  id: ID
  enabled: boolean
  defaultNotificationTime: string // HH:mm
}
```

---

## ReminderCategorySetting

```ts
type ReminderCategorySetting = AuditFields & {
  id: ID
  reminderType: ReminderType
  enabled: boolean
  timings: ReminderTiming[]
  customDaysBefore?: Nullable<number>
  notificationTime?: Nullable<string> // HH:mm
}
```

---

## CatReminderOverride

猫ごとの通知上書き設定。  
MVPでは未使用でも、将来拡張用に定義しておく。

```ts
type CatReminderOverride = AuditFields & {
  id: ID
  catId: ID
  reminderType: ReminderType
  enabled?: boolean
  timings?: ReminderTiming[]
  notificationTime?: Nullable<string>
}
```

---

# 7. Sharing Models

MVPでは本格実装しないが、家族共有に向けて型を用意する。

## Household

```ts
type Household = AuditFields & {
  id: ID
  name: string
  ownerUserId: ID
}
```

---

## HouseholdMember

```ts
type HouseholdMember = AuditFields & {
  id: ID
  householdId: ID
  userId: ID

  displayName: string
  role: 'owner' | 'editor' | 'viewer'
}
```

---

## CatSharePermission

```ts
type CatSharePermission = AuditFields & {
  id: ID
  catId: ID
  householdMemberId: ID

  canView: boolean
  canEdit: boolean
  canManageReminders: boolean
  canManageInsurance: boolean
}
```

---

# 8. Screen Data Models

画面が必要とするデータをまとめた型。

---

## HomeScreenData

```ts
type HomeScreenData = {
  cats: Cat[]
  todayTasks: HomeTask[]
  upcomingPlans: UpcomingPlan[]
  infoCompletionSuggestions: InfoCompletionSuggestion[]
}
```

---

## CatListItem

```ts
type CatListItem = {
  id: ID
  name: string
  photoUrl?: Nullable<string>

  sex: CatSex

  birthDate?: Nullable<DateString>
  birthDateType: BirthDateType

  coatColorPattern?: Nullable<string>

  nextPlan?: Nullable<{
    type: ReminderType
    title: string
    scheduledDate: DateString
    daysUntil: number
  }>

  hasWarning: boolean
  pendingTaskCount: number

  createdAt: DateTimeString
  updatedAt: DateTimeString
}
```

---

## CatListScreenData

```ts
type CatListScreenData = {
  cats: CatListItem[]
}
```

---

## CatDetailScreenData

```ts
type CatDetailScreenData = {
  cat: Cat

  medicalProfile?: Nullable<CatMedicalProfile>
  foodProfile?: Nullable<CatFoodProfile>
  insuranceProfile?: Nullable<CatInsuranceProfile>
  careProfile?: Nullable<CatCareProfile>

  records: CatRecord[]
  todayTasks: HomeTask[]
  upcomingPlans: UpcomingPlan[]
}
```

---

# 9. データの考え方

## プロフィールとレコードの分離

プロフィールは「現在の状態」を表す。

例：

- 現在の主治医
- 現在加入している保険
- いつものフード
- 性格や注意事項
- 最新のワクチン日
- 次回予定日

レコードは「過去に起きた出来事」を表す。

例：

- 2026/05/07に通院した
- 2026/05/07に体重を測った
- 2026/05/07にワクチンを打った
- 2026/05/07に保険請求をした
- 2026/05/07にフードを食べなかった

---

## 予定・タスク・通知の違い

### 予定

未来の日付として登録されているもの。

例：

- 次回ワクチン日
- 次回駆虫薬日
- 次回通院日
- 誕生日
- うちの子記念日

### タスク

ホーム画面で「今日やること」として表示するもの。

例：

- 今日ワクチン予定
- 今日通院予定
- 保険請求が未対応
- 今日投薬する

### 通知

端末に実際に通知するもの。

例：

- ワクチン予定日の7日前通知
- 通院前日の通知
- 誕生日当日の通知
- 保険請求未対応3日後の通知

---

# 10. MVPで必須のモデル

MVPでは、少なくとも以下のモデルを実装対象とする。

- `Cat`
- `CatMedicalProfile`
- `CatFoodProfile`
- `CatInsuranceProfile`
- `CatCareProfile`
- `CatRecord`
- `HomeTask`
- `UpcomingPlan`
- `Reminder`
- `ReminderGlobalSettings`
- `ReminderCategorySetting`

家族共有系モデルは、MVPでは型定義のみでもよい。

---

# 11. 初期実装でやること

- 共通型の定義
- Enum / Union Types の定義
- `Cat` の定義
- プロフィール系モデルの定義
- 記録系モデルの定義
- ホームタスク系モデルの定義
- 通知系モデルの定義
- 画面データ型の定義
- 仮データをこの型に合わせて作成
- 各画面仕様書のデータモデルとフィールド名を揃える

---

# 12. 初期実装ではやらないこと

- DBスキーマの確定
- サーバーAPIの確定
- 家族共有の本実装
- 複数端末同期
- 権限管理の詳細
- 画像アップロードの実装
- 通知履歴の永続化詳細

ただし、将来的に追加できるように型は拡張しやすくしておく。
