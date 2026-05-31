export type ID = string;
export type DateString = string;
export type DateTimeString = string;
export type Nullable<T> = T | null;

export type AuditFields = {
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
};

export type CatSex = 'male' | 'female' | 'unknown';
export type BirthDateType = 'exact' | 'estimated' | 'unknown';
export type AdoptionDateType = 'exact' | 'unknown';
export type BreedType = 'purebred' | 'mixed' | 'unknown';
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

export type Cat = AuditFields & {
  id: ID;
  name: string;
  photoUrl: Nullable<string>;
  sex: CatSex;
  birthDate: Nullable<DateString>;
  birthDateType: BirthDateType;
  adoptionDate: Nullable<DateString>;
  adoptionDateType: AdoptionDateType;
  breed: Nullable<string>;
  breedType: BreedType;
  coatColorPattern: Nullable<string>;
};

export type CatMedicalProfile = AuditFields & {
  id: ID;
  catId: ID;
  sterilizationStatus: SterilizationStatus;
  primaryHospitalName: Nullable<string>;
  primaryDoctorName: Nullable<string>;
  hospitalPhoneNumber: Nullable<string>;
  medicalHistory: Nullable<string>;
  latestVaccineDate: Nullable<DateString>;
  nextVaccineDate: Nullable<DateString>;
  latestDewormingDate: Nullable<DateString>;
  nextDewormingDate: Nullable<DateString>;
  medicalNote: Nullable<string>;
};

export type CatFoodProfile = AuditFields & {
  id: ID;
  catId: ID;
  regularFood: Nullable<string>;
  favoriteFood: Nullable<string>;
  dislikedFood: Nullable<string>;
  foodAllergies: Nullable<string>;
  foodNote: Nullable<string>;
};

export type CatInsuranceProfile = AuditFields & {
  id: ID;
  catId: ID;
  insuranceName: Nullable<string>;
  insurancePlan: Nullable<string>;
  insurancePolicyNumber: Nullable<string>;
  insuranceNote: Nullable<string>;
};

export type CatCareProfile = AuditFields & {
  id: ID;
  catId: ID;
  hasMedication: boolean;
  medicationNote: Nullable<string>;
  personality: Nullable<string>;
  dislikes: Nullable<string>;
  awayCareNote: Nullable<string>;
  familyNote: Nullable<string>;
};

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

export type TaskStatus = 'pending' | 'completed' | 'snoozed';
export type ScheduleStatus = 'scheduled' | 'done' | 'cancelled';
export type ReminderTiming =
  | 'seven_days_before'
  | 'three_days_before'
  | 'one_day_before'
  | 'on_the_day'
  | 'custom';

export type HomeTask = AuditFields & {
  id: ID;
  catId: ID;
  type: ReminderType;
  title: string;
  dueDate: DateString;
  status: TaskStatus;
};

export type CatRecordBase = AuditFields & {
  id: ID;
  catId: ID;
  type: RecordType;
  recordDate: DateString;
  memo: Nullable<string>;
};

export type WeightRecord = CatRecordBase & {
  type: 'weight';
  weightKg: number;
};

export type HospitalVisitRecord = CatRecordBase & {
  type: 'hospital_visit';
  hospitalName: string;
  summary: string;
  nextVisitDate: Nullable<DateString>;
};

export type FoodRecord = CatRecordBase & {
  type: 'food';
  foodName: string;
  status: FoodStatus;
  brand: Nullable<string>;
  flavor: Nullable<string>;
};

export type InsuranceRecord = CatRecordBase & {
  type: 'insurance';
  hospitalName: string;
  amountYen: number;
  diagnosisName: Nullable<string>;
  claimStatus: InsuranceClaimStatus;
};

export type MemoRecord = CatRecordBase & {
  type: 'memo';
  title: string;
  category: MemoCategory;
  body: string;
};

export type MedicationRecord = CatRecordBase & {
  type: 'medication';
  medicineName: string;
  timing: MedicationTiming;
};

export type HealthConditionRecord = CatRecordBase & {
  type: 'health_condition';
  category: HealthCategory;
  status: ConditionStatus;
};

export type CatRecord =
  | WeightRecord
  | HospitalVisitRecord
  | FoodRecord
  | InsuranceRecord
  | MemoRecord
  | MedicationRecord
  | HealthConditionRecord;

export type CatSchedule = AuditFields & {
  id: ID;
  catId: ID;
  type: ReminderType;
  dueDate: DateString;
  title: string;
  status: ScheduleStatus;
};

export type ReminderSetting = AuditFields & {
  id: ID;
  type: ReminderType;
  enabled: boolean;
  timings: ReminderTiming[];
};
