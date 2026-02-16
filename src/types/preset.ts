import type { InfusionSet } from "./infusion";

// プリセットデータ（AsyncStorageに保存）
export interface Preset {
  id: string;
  name: string;
  infusionSet: InfusionSet;
  volume: string;
  hours: string;
  minutes: string;
  createdAt: string;
  updatedAt: string;
}

// 新規プリセット作成用
export type PresetCreateData = Omit<Preset, "id" | "createdAt" | "updatedAt">;

// プリセット更新用
export type PresetUpdateData = Partial<Omit<Preset, "id" | "createdAt">>;
