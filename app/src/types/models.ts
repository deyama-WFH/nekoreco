export type ID = string;
export type DateString = string;
export type DateTimeString = string;
export type Nullable<T> = T | null;
export type AuditFields = { createdAt: DateTimeString; updatedAt: DateTimeString };

export type CatSex = 'male' | 'female' | 'unknown';
export type BirthDateType = 'exact' | 'estimated' | 'unknown';
export type AdoptionDateType = 'exact' | 'unknown';
export type BreedType = 'purebred' | 'mixed' | 'unknown';
export type RecordType =
  | 'weight'
  | 'hospital_visit'
  | 'vaccine'
  | 'deworming'
  | 'medication'
  | 'food'
  | 'health_condition'
  | 'care'
  | 'insurance'
  | 'memo';
export type FoodStatus =
  | 'favorite'
  | 'ate'
  | 'ate_a_little'
  | 'did_not_eat'
  | 'got_bored'
  | 'not_suitable';
export type InsuranceClaimStatus =
  | 'unclaimed'
  | 'preparing'
  | 'claimed'
  | 'paid'
  | 'not_applicable';
export type MemoCategory = 'personality' | 'care' | 'away' | 'hospital' | 'family' | 'other';
export type MedicationTiming = 'morning' | 'noon' | 'night' | 'before_sleep' | 'other';
export type HealthCategory =
  | 'appetite'
  | 'vomiting'
  | 'diarrhea'
  | 'excretion'
  | 'drinking'
  | 'energy'
  | 'other';
export type ConditionStatus = 'good' | 'normal' | 'concern' | 'bad';
export type SterilizationStatus = 'done' | 'not_done' | 'unknown';
export type ReminderType =
  | 'vaccine'
  | 'deworming'
  | 'hospital_visit'
  | 'medication'
  | 'birthday'
  | 'adoption_anniversary'
  | 'insurance_claim'
  | 'weight_record'
  | 'care';
export type ReminderTiming =
  | 'seven_days_before'
  | 'three_days_before'
  | 'one_day_before'
  | 'on_the_day'
  | 'custom';
export type ReminderStatus = 'scheduled' | 'sent' | 'cancelled' | 'completed';
export type TaskStatus = 'pending' | 'completed' | 'snoozed';

export type Cat = AuditFields & {
  id: ID;
  name: string;
  photoUrl?: Nullable<string>;
  sex: CatSex;
  birthDate?: Nullable<DateString>;
  birthDateType: BirthDateType;
  adoptionDate?: Nullable<DateString>;
  adoptionDateType: AdoptionDateType;
  breed?: Nullable<string>;
  breedType: BreedType;
  coatColorPattern?: Nullable<string>;
  isArchived?: boolean;
};

export type CatMedicalProfile = AuditFields & {
  id: ID;
  catId: ID;
  primaryHospitalName?: Nullable<string>;
  primaryDoctorName?: Nullable<string>;
  hospitalPhoneNumber?: Nullable<string>;
  medicalHistory?: Nullable<string>;
  sterilizationStatus?: SterilizationStatus;
  latestVaccineDate?: Nullable<DateString>;
  nextVaccineDate?: Nullable<DateString>;
  latestDewormingDate?: Nullable<DateString>;
  nextDewormingDate?: Nullable<DateString>;
  latestHospitalVisitDate?: Nullable<DateString>;
  nextHospitalVisitDate?: Nullable<DateString>;
  medicalNote?: Nullable<string>;
};

export type CatFoodProfile = AuditFields & {
  id: ID;
  catId: ID;
  regularFood?: Nullable<string>;
  favoriteFood?: Nullable<string>;
  dislikedFood?: Nullable<string>;
  foodAllergies?: Nullable<string>;
  foodNote?: Nullable<string>;
};

export type CatInsuranceProfile = AuditFields & {
  id: ID;
  catId: ID;
  insuranceName?: Nullable<string>;
  insurancePlan?: Nullable<string>;
  insurancePolicyNumber?: Nullable<string>;
  insuranceNote?: Nullable<string>;
};

export type CatCareProfile = AuditFields & {
  id: ID;
  catId: ID;
  personality?: Nullable<string>;
  likes?: Nullable<string>;
  dislikes?: Nullable<string>;
  careNotes?: Nullable<string>;
  awayCareNote?: Nullable<string>;
  familyNote?: Nullable<string>;
  hasMedication?: boolean;
  medicationNote?: Nullable<string>;
};

export type BaseRecord = AuditFields & {
  id: ID;
  catId: ID;
  recordType: RecordType;
  recordedAt: DateTimeString;
  note?: Nullable<string>;
};
export type WeightRecord = BaseRecord & { recordType: 'weight'; weightKg: number };
export type HospitalVisitRecord = BaseRecord & {
  recordType: 'hospital_visit';
  visitedAt: DateString;
  hospitalName?: Nullable<string>;
  doctorName?: Nullable<string>;
  visitNote?: Nullable<string>;
  diagnosisName?: Nullable<string>;
  prescribedMedication?: Nullable<string>;
  inspectionNote?: Nullable<string>;
  weightKg?: Nullable<number>;
  amount?: Nullable<number>;
  nextVisitDate?: Nullable<DateString>;
  insuranceClaimStatus?: Nullable<InsuranceClaimStatus>;
  receiptPhotoUrl?: Nullable<string>;
};
export type VaccineRecord = BaseRecord & {
  recordType: 'vaccine';
  vaccineDate: DateString;
  vaccineName?: Nullable<string>;
  nextVaccineDate?: Nullable<DateString>;
  hospitalName?: Nullable<string>;
};
export type DewormingRecord = BaseRecord & {
  recordType: 'deworming';
  dewormingDate: DateString;
  medicineName?: Nullable<string>;
  nextDewormingDate?: Nullable<DateString>;
};
export type MedicationRecord = BaseRecord & {
  recordType: 'medication';
  medicationName: string;
  dosage?: Nullable<string>;
  timing?: Nullable<MedicationTiming>;
  isGiven: boolean;
};
export type FoodRecord = BaseRecord & {
  recordType: 'food';
  foodName: string;
  brand?: Nullable<string>;
  flavor?: Nullable<string>;
  shape?: Nullable<string>;
  foodStatus: FoodStatus;
};
export type HealthConditionRecord = BaseRecord & {
  recordType: 'health_condition';
  healthCategory: HealthCategory;
  conditionStatus: ConditionStatus;
};
export type CareRecord = BaseRecord & {
  recordType: 'care';
  careType: 'nail_cut' | 'brushing' | 'shampoo' | 'ear_cleaning' | 'tooth_brushing' | 'other';
  careTitle: string;
};
export type InsuranceClaimRecord = BaseRecord & {
  recordType: 'insurance';
  visitDate?: Nullable<DateString>;
  hospitalName?: Nullable<string>;
  amount?: Nullable<number>;
  diagnosisName?: Nullable<string>;
  claimStatus: InsuranceClaimStatus;
  receiptPhotoUrl?: Nullable<string>;
};
export type MemoRecord = BaseRecord & {
  recordType: 'memo';
  title?: Nullable<string>;
  memoCategory: MemoCategory;
  body: string;
};
export type CatRecord =
  | WeightRecord
  | HospitalVisitRecord
  | VaccineRecord
  | DewormingRecord
  | MedicationRecord
  | FoodRecord
  | HealthConditionRecord
  | CareRecord
  | InsuranceClaimRecord
  | MemoRecord;

export type HomeTask = AuditFields & {
  id: ID;
  catId: ID;
  type: ReminderType;
  title: string;
  description?: Nullable<string>;
  dueDate: DateString;
  reminderDate?: Nullable<DateString>;
  status: TaskStatus;
  sourceType?:
    | 'vaccine'
    | 'deworming'
    | 'hospital_visit'
    | 'medication'
    | 'insurance_claim'
    | 'care'
    | 'anniversary'
    | 'manual';
  sourceId?: Nullable<ID>;
};
export type UpcomingPlan = {
  id: ID;
  catId: ID;
  catName: string;
  catPhotoUrl?: Nullable<string>;
  type: ReminderType;
  title: string;
  scheduledDate: DateString;
  daysUntil: number;
  sourceId?: Nullable<ID>;
};
export type InfoCompletionSuggestion = {
  id: ID;
  catId: ID;
  catName: string;
  missingFields: Array<'vaccine' | 'deworming' | 'hospital' | 'insurance' | 'food' | 'care_notes'>;
  message: string;
  dismissedUntil?: Nullable<DateTimeString>;
};
export type Reminder = AuditFields & {
  id: ID;
  catId: ID;
  reminderType: ReminderType;
  title: string;
  body: string;
  scheduledAt: DateTimeString;
  targetDate?: Nullable<DateString>;
  status: ReminderStatus;
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
    | 'manual';
  sourceId?: Nullable<ID>;
};
export type ReminderGlobalSettings = AuditFields & {
  id: ID;
  enabled: boolean;
  defaultNotificationTime: string;
};
export type ReminderCategorySetting = AuditFields & {
  id: ID;
  reminderType: ReminderType;
  enabled: boolean;
  timings: ReminderTiming[];
  customDaysBefore?: Nullable<number>;
  notificationTime?: Nullable<string>;
};

export type Profiles = {
  medical: CatMedicalProfile[];
  food: CatFoodProfile[];
  insurance: CatInsuranceProfile[];
  care: CatCareProfile[];
};
