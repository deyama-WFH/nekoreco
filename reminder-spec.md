# ねこレコ 通知・リマインダー仕様

## 目的

このドキュメントは、ねこレコの「通知・リマインダー機能」を Codex で実装するための仕様書です。

ねこレコは、猫ごとの情報を記録するだけでなく、次に必要なお世話・通院・予防医療・保険請求・記念日を忘れないようにするアプリです。  
通知・リマインダー機能は、ねこレコの中核価値である「次にやることを教えてくれる個体管理」を実現するための機能です。

---

## 基本方針

- 記録した情報から、次回予定や未対応タスクを通知する
- 初期実装では本人へのローカル通知を中心にする
- 家族への通知共有は将来拡張とする
- 通知はカテゴリごとにON/OFFできるようにする
- 通知タイミングはデフォルト値を用意し、あとから変更できるようにする
- ホーム画面の「今日やること」「近日の予定」と連動する
- 通知がなくても、ホーム上でタスクとして確認できるようにする

---

## 通知対象

MVPでは以下を通知対象とする。

| 通知対象 | reminderType | MVP |
|---|---|---:|
| ワクチン | `vaccine` | 対象 |
| 駆虫薬 | `deworming` | 対象 |
| 通院予定 | `hospital_visit` | 対象 |
| 投薬 | `medication` | 対象 |
| 誕生日 | `birthday` | 対象 |
| うちの子記念日 | `adoption_anniversary` | 対象 |
| 保険請求 | `insurance_claim` | 対象 |
| 体重記録 | `weight_record` | 任意 |
| ケア予定 | `care` | 任意 |

---

## 通知タイプ定義

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

## 通知タイミング

MVPでは、以下の通知タイミングを基本とする。

```ts
type ReminderTiming =
  | 'seven_days_before'
  | 'three_days_before'
  | 'one_day_before'
  | 'on_the_day'
  | 'custom'
```

表示文言：

| timing | 表示名 |
|---|---|
| `seven_days_before` | 7日前 |
| `three_days_before` | 3日前 |
| `one_day_before` | 前日 |
| `on_the_day` | 当日 |
| `custom` | カスタム |

---

## デフォルト通知設定

| 通知対象 | デフォルト通知 |
|---|---|
| ワクチン | 7日前・前日・当日 |
| 駆虫薬 | 3日前・当日 |
| 通院予定 | 前日・当日 |
| 投薬 | 時間指定 |
| 誕生日 | 7日前・当日 |
| うちの子記念日 | 7日前・当日 |
| 保険請求 | 未請求のまま3日経過したら通知 |
| 体重記録 | 初期OFF |
| ケア予定 | 初期OFF |

---

# 1. ワクチン通知

## reminderType

`vaccine`

## 目的

ワクチン接種予定を忘れないようにする。

## 通知条件

- `nextVaccineDate` が登録されている
- ワクチン通知がON
- 通知予定日が現在日付に該当する

## デフォルト通知

- 7日前
- 前日
- 当日

## 通知文言

### 7日前・前日

```text
りおちゃんのワクチン予定が近づいています
予定日：2026年6月10日
```

### 当日

```text
今日はりおちゃんのワクチン予定日です
```

## ホーム連動

- 当日の場合、ホームの「今日やること」に表示
- 7日以内の場合、ホームの「近日の予定」に表示

---

# 2. 駆虫薬通知

## reminderType

`deworming`

## 目的

ノミダニ・駆虫薬などの投与予定を忘れないようにする。

## 通知条件

- `nextDewormingDate` が登録されている
- 駆虫薬通知がON
- 通知予定日が現在日付に該当する

## デフォルト通知

- 3日前
- 当日

## 通知文言

```text
りおちゃんの駆虫薬予定が近づいています
予定日：2026年6月10日
```

```text
今日はりおちゃんの駆虫薬予定日です
```

## ホーム連動

- 当日の場合、ホームの「今日やること」に表示
- 7日以内の場合、ホームの「近日の予定」に表示

---

# 3. 通院予定通知

## reminderType

`hospital_visit`

## 目的

病院で言われた次回通院予定を忘れないようにする。

## 通知条件

- `nextVisitDate` または通院予定が登録されている
- 通院通知がON
- 通知予定日が現在日付に該当する

## デフォルト通知

- 前日
- 当日

## 通知文言

```text
明日はりおちゃんの通院予定です
```

```text
今日はりおちゃんの通院予定日です
```

## 関連機能

通院記録時に「次回は○週間後」から予定を作成した場合も、この通知対象にする。

## ホーム連動

- 当日の場合、ホームの「今日やること」に表示
- 7日以内の場合、ホームの「近日の予定」に表示

---

# 4. 投薬通知

## reminderType

`medication`

## 目的

薬の飲ませ忘れを防ぐ。

## MVPでの扱い

MVPでは、簡易的な時間指定通知を想定する。  
繰り返しスケジュールや家族ごとの完了管理は将来拡張とする。

## 通知条件

- 投薬予定が登録されている
- 投薬通知がON
- 指定時刻になった

## デフォルト通知

- ユーザーが指定した時刻

## 通知文言

```text
りおちゃんの投薬時間です
薬：カルベジロール
```

## ホーム連動

- 当日の投薬予定はホームの「今日やること」に表示
- 完了するとタスクステータスを `completed` にする

---

# 5. 誕生日通知

## reminderType

`birthday`

## 目的

誕生日を忘れず、家族みんなでお祝いできるようにする。

## 通知条件

- `birthDate` が登録されている
- `birthDateType` が `exact` または `estimated`
- 誕生日通知がON
- 通知予定日が現在日付に該当する

## デフォルト通知

- 7日前
- 当日

## 通知文言

```text
もうすぐりおちゃんの誕生日です
7日後にお祝いしましょう
```

```text
今日はりおちゃんの誕生日です
おめでとうございます！
```

## 推定誕生日の場合

推定誕生日でも通知対象にする。  
表示では「推定」をつけてもよい。

```text
今日はりおちゃんの推定誕生日です
```

---

# 6. うちの子記念日通知

## reminderType

`adoption_anniversary`

## 目的

うちの子記念日を忘れず、家族でお祝いできるようにする。

## 通知条件

- `adoptionDate` が登録されている
- うちの子記念日通知がON
- 通知予定日が現在日付に該当する

## デフォルト通知

- 7日前
- 当日

## 通知文言

```text
もうすぐりおちゃんのうちの子記念日です
```

```text
今日はりおちゃんのうちの子記念日です
家族になった日をお祝いしましょう
```

---

# 7. 保険請求通知

## reminderType

`insurance_claim`

## 目的

ペット保険の請求忘れを防ぐ。

## 通知条件

- 保険請求ステータスが `unclaimed`
- 通院日または保険記録作成日から3日経過
- 保険請求通知がON

## デフォルト通知

- 未請求のまま3日経過したら通知

## 通知文言

```text
りおちゃんの保険請求はお済みですか？
未請求の通院記録があります
```

## ホーム連動

- 未請求の保険記録がある場合、ホームの「今日やること」または注意表示に出す
- 「請求済みにする」で `claimStatus` を `claimed` に更新する

---

# 8. 体重記録通知

## reminderType

`weight_record`

## 目的

定期的な体重記録を促す。

## MVPでの扱い

初期設定ではOFF。  
将来的に「毎週」「毎月」「前回記録から○日後」などを設定できるようにする。

## 初期実装

- データ型のみ用意
- 通知実送信は後回しでもよい

---

# 9. ケア予定通知

## reminderType

`care`

## 目的

爪切り、ブラッシング、シャンプーなどのケア予定を忘れないようにする。

## MVPでの扱い

初期設定ではOFF。  
将来的にケア予定として追加できるようにする。

---

# 10. 通知設定画面

## 画面ID

`ReminderSettingsScreen`

## 目的

通知カテゴリごとのON/OFFと通知タイミングを設定できるようにする。

## 表示内容

- 通知全体のON/OFF
- カテゴリ別ON/OFF
- カテゴリ別通知タイミング
- 通知時刻の設定
- 家族通知設定の将来導線

---

## 通知全体設定

```ts
type ReminderGlobalSettings = {
  enabled: boolean
}
```

表示文言：

```text
通知を受け取る
```

---

## カテゴリ別設定

```ts
type ReminderCategorySetting = {
  reminderType: ReminderType
  enabled: boolean
  timings: ReminderTiming[]
  customDaysBefore?: number | null
  notificationTime?: string | null
}
```

---

## 画面表示例

```text
通知設定

通知を受け取る：ON

ワクチン
ON
7日前・前日・当日

駆虫薬
ON
3日前・当日

通院予定
ON
前日・当日

投薬
ON
指定時刻

誕生日
ON
7日前・当日

うちの子記念日
ON
7日前・当日

保険請求
ON
未請求のまま3日後
```

---

# 11. 猫ごとの通知設定

## 目的

将来的に猫ごとに通知ON/OFFを切り替えられるようにする。

## MVPでの扱い

MVPでは全体設定を基本とする。  
ただしデータモデルには猫ごとの上書き設定を持てる余地を残す。

```ts
type CatReminderOverride = {
  catId: string
  reminderType: ReminderType
  enabled?: boolean
  timings?: ReminderTiming[]
  notificationTime?: string | null
}
```

---

# 12. 通知データモデル

## Reminder

```ts
type Reminder = {
  id: string
  catId: string
  reminderType: ReminderType

  title: string
  body: string

  scheduledAt: string
  targetDate?: string | null

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

  sourceId?: string | null

  createdAt: string
  updatedAt: string
}
```

## ReminderStatus

```ts
type ReminderStatus =
  | 'scheduled'
  | 'sent'
  | 'cancelled'
  | 'completed'
```

---

# 13. ホームタスクとの関係

通知とホームタスクは別概念だが、同じ元データから生成される。

## HomeTask

```ts
type HomeTask = {
  id: string
  catId: string
  type: ReminderType
  title: string
  description?: string | null
  dueDate: string
  status: 'pending' | 'completed' | 'snoozed'
  sourceId?: string | null
}
```

## 方針

- 通知は端末に知らせるためのもの
- ホームタスクはアプリ内で今日やることを表示するためのもの
- 通知をOFFにしても、ホームタスクは表示してよい
- タスクを完了した場合、関連する通知やリマインダーも完了扱いにできる

---

# 14. 通知生成ルール

## 基本

予定日や期限日をもとに、通知予定日時を生成する。

例：

```ts
targetDate = '2026-06-10'
timing = 'seven_days_before'
notificationTime = '09:00'
scheduledAt = '2026-06-03T09:00:00'
```

## 日付計算

| timing | 計算 |
|---|---|
| 7日前 | targetDate - 7 days |
| 3日前 | targetDate - 3 days |
| 前日 | targetDate - 1 day |
| 当日 | targetDate |
| custom | targetDate - customDaysBefore |

## 通知時刻

- 投薬以外の初期通知時刻は 9:00 を推奨
- 投薬はユーザー指定時刻
- 将来的にユーザー設定で変更可能にする

---

# 15. 通知更新・キャンセル

## 更新が必要なケース

- 次回予定日が変更された
- ワクチン予定が削除された
- 通院予定が完了した
- 保険請求ステータスが `claimed` になった
- 通知設定がOFFになった
- 猫が削除またはアーカイブされた

## 挙動

- 元データが変更されたら、関連する未送信通知を再生成する
- 不要になった通知は `cancelled` にする
- すでに送信済みの通知は履歴として残してもよい

---

# 16. 家族共有との関係

## MVPでの扱い

初期実装では、通知は本人に届くものとする。  
家族への通知共有は第2弾以降で実装する。

## 将来拡張

- 家族にも通知する
- 家族ごとに通知ON/OFFを設定する
- 投薬通知を家族全員に送る
- 誰かが完了したら他の家族のタスクも完了扱いにする
- 留守番モード中だけ通知先を変更する

---

# 17. 権限・許可

## 初回通知許可

通知を使用するには、OSの通知許可が必要。

## 推奨導線

オンボーディング直後に強制的に許可を求めるのではなく、最初に通知対象の予定を登録したタイミング、または通知設定画面でONにしたタイミングで許可を求める。

## 文言例

```text
予定を忘れないように通知を受け取りますか？
ワクチン・通院・記念日などを事前にお知らせします。
```

ボタン：

```text
通知を許可する
あとで
```

---

# 18. 通知一覧画面

## 画面ID

`NotificationListScreen`

## MVPでの扱い

初期実装では必須ではない。  
ホーム画面の通知アイコンから将来的に遷移できる余地を残す。

## 将来表示する内容

- 送信済み通知
- 予定中の通知
- 未完了タスク
- 完了済みタスク

---

# 19. 推奨コンポーネント

## 画面コンポーネント

- `ReminderSettingsScreen`
- `NotificationPermissionPrompt`
- `NotificationListScreen`

## 設定コンポーネント

- `ReminderGlobalToggle`
- `ReminderCategorySettingCard`
- `ReminderTimingSelector`
- `NotificationTimePicker`

## ロジック

- `generateRemindersForCat`
- `generateRemindersForVaccine`
- `generateRemindersForDeworming`
- `generateRemindersForHospitalVisit`
- `generateRemindersForMedication`
- `generateRemindersForAnniversary`
- `generateRemindersForInsuranceClaim`
- `cancelRemindersBySource`
- `rescheduleRemindersBySource`

---

# 20. 受け入れ条件

## 通知設定

- 通知全体のON/OFFを切り替えられる
- ワクチン、駆虫薬、通院、投薬、誕生日、うちの子記念日、保険請求の通知設定を表示できる
- カテゴリ別に通知ON/OFFを切り替えられる
- カテゴリごとのデフォルト通知タイミングが設定されている

## ワクチン・駆虫薬

- 次回予定日が登録されると、通知予定が生成される
- 7日以内の予定はホームの近日の予定に表示される
- 当日の予定はホームの今日やることに表示される

## 通院

- 通院記録で次回予定日を登録すると、通知予定が生成される
- 前日と当日の通知が生成される

## 投薬

- 投薬予定に時刻がある場合、その時刻の通知が生成される
- 当日の投薬予定はホームの今日やることに表示される

## 記念日

- 誕生日が登録されている猫は、7日前と当日の通知対象になる
- うちの子記念日が登録されている猫は、7日前と当日の通知対象になる
- 推定誕生日でも通知対象にできる

## 保険請求

- 保険請求ステータスが未請求のまま3日経過した場合、通知対象になる
- 請求済みにした場合、関連する未請求通知はキャンセルまたは完了になる

## 通知許可

- 通知が必要になったタイミングでOS通知許可の導線を出せる
- 通知許可がない場合でも、ホームタスクは表示される

---

# 21. 初期実装でやること

初期実装では、以下を対象とする。

- 通知タイプ定義
- 通知設定データモデル
- デフォルト通知設定
- ワクチン通知生成
- 駆虫薬通知生成
- 通院通知生成
- 投薬通知生成の簡易版
- 誕生日通知生成
- うちの子記念日通知生成
- 保険請求通知生成
- ホームタスクとの連動
- 通知許可導線
- ローカル通知の土台
- 仮データでの通知生成テスト

---

# 22. 初期実装ではやらないこと

以下は初期実装では対象外とする。

- 家族への通知送信
- 家族ごとの通知設定
- 通知一覧画面の本実装
- プッシュ通知サーバー
- 複数端末同期
- 高度な繰り返し投薬スケジュール
- 体重記録通知の本実装
- ケア予定通知の本実装
- 通知履歴の詳細管理

ただし、将来的に追加できるように、データ構造と関数設計は拡張しやすくしておく。
