export interface BaseEntity {
  id?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export enum FuzzyBoolean {
  TRUE = "TRUE",
  FALSE = "FALSE",
  UNKNOWN = "UNKNOWN"
}

export interface RunningDinnerRelated extends BaseEntity {
  runningDinnerId: string;
  adminId: string;
}

export interface SelectOption {
  label: string;
  value: string;
  description: string;
}

export enum GenderAspects {
  FORCE_GENDER_MIX = "FORCE_GENDER_MIX",
  FORCE_SAME_GENDER = "FORCE_SAME_GENDER",
  IGNORE_GENDE0R = "IGNORE_GENDE0R"
}
