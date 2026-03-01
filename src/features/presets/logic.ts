import type { Preset, PresetCreateData, PresetUpdateData } from "../../types";

// プリセット作成データからPresetオブジェクトを生成
export const createPreset = (id: string, data: PresetCreateData, now: string): Preset => ({
  id,
  name: data.name,
  infusionSet: data.infusionSet,
  volume: data.volume,
  hours: data.hours,
  minutes: data.minutes,
  createdAt: now,
  updatedAt: now,
});

// 既存プリセットに更新を適用
export const updatePresetData = (
  preset: Preset,
  updates: PresetUpdateData,
  now: string
): Preset => ({
  ...preset,
  ...updates,
  updatedAt: now,
});
