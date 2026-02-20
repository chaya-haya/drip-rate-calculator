// 輸液セットの種別
export type InfusionSetId = "adult" | "pediatric";

export interface InfusionSet {
  id: InfusionSetId;
  name: string;
  dropsPerMl: number;
  description: string;
}

export interface InfusionSets {
  ADULT: InfusionSet;
  PEDIATRIC: InfusionSet;
}

// 通知タイミング
export interface NotificationTimingOption {
  id: string;
  label: string;
  minutes: number;
}

// アニメーション設定
export interface AnimationConfig {
  MIN_INTERVAL_MS: number;
  MAX_DROPS_PER_MINUTE: number;
}

// 入力制限値
export interface InputLimits {
  MAX_VOLUME_ML: number;
  MIN_TOTAL_MINUTES: number;
  MAX_TOTAL_MINUTES: number;
  MAX_HOURS: number;
  MAX_MINUTES: number;
}

// 患者ステータス
export type PatientStatusId = "waiting" | "running" | "ending_soon" | "completed";

export interface PatientStatusConfig {
  id: PatientStatusId;
  label: string;
  color: string;
}

export interface PatientStatuses {
  WAITING: PatientStatusConfig;
  RUNNING: PatientStatusConfig;
  ENDING_SOON: PatientStatusConfig;
  COMPLETED: PatientStatusConfig;
}
