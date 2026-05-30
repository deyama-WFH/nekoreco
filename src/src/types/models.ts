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

export type HomeTask = AuditFields & {
  id: ID;
  catId: ID;
  type: ReminderType;
  title: string;
  dueDate: DateString;
  status: TaskStatus;
};
