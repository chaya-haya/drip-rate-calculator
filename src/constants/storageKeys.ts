// AsyncStorage キー定数
export const STORAGE_KEYS = {
  PATIENTS: "@drip_calculator/patients",
  PRESETS: "@drip_calculator/presets",
  NOTIFICATION_MAP: "@drip_calculator/notification_map",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
