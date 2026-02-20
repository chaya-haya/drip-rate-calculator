import type { InfusionSet, NotificationTimingOption, PatientStatusConfig } from "./infusion";
import type { HapticIntensity } from "./hooks";

// 患者データ（AsyncStorageに保存）
export interface Patient {
  id: string;
  roomNumber: string;
  bedNumber: string;
  infusionSet: InfusionSet;
  volume: string;
  hours: string;
  minutes: string;
  isRunning: boolean;
  startedAt: string | null;
  endTime: string | null;
  notificationEnabled: boolean;
  notificationTiming: NotificationTimingOption;
  hapticEnabled: boolean;
  hapticIntensity: HapticIntensity;
  createdAt: string;
  updatedAt: string;
}

// 計算済みステータス・残り時間付きの患者データ
export interface PatientWithStatus extends Patient {
  status: PatientStatusConfig;
  remainingTime: number | null;
}

// 新規患者作成用
export type PatientCreateData = Partial<Omit<Patient, "id" | "createdAt" | "updatedAt">>;

// 患者更新用
export type PatientUpdateData = Partial<Omit<Patient, "id" | "createdAt">>;
