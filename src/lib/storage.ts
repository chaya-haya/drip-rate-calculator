import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import type { Patient } from "../types/patient";
import type { Preset } from "../types/preset";
import type {
  NotificationMap,
  SerializedNotificationMap,
} from "../types/notification";
import type { StorageResult, StorageSaveResult } from "../types/storage";

// 患者データを保存
export const savePatients = async (
  patients: Patient[]
): Promise<StorageSaveResult> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PATIENTS,
      JSON.stringify(patients)
    );
    return { success: true };
  } catch (error) {
    console.error("患者データの保存に失敗:", error);
    return { success: false, error: error as Error };
  }
};

// 患者データを読み込み
export const loadPatients = async (): Promise<StorageResult<Patient[]>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PATIENTS);
    return { success: true, data: data ? (JSON.parse(data) as Patient[]) : [] };
  } catch (error) {
    console.error("患者データの読み込みに失敗:", error);
    return { success: false, error: error as Error, data: [] };
  }
};

// プリセットを保存
export const savePresets = async (
  presets: Preset[]
): Promise<StorageSaveResult> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
    return { success: true };
  } catch (error) {
    console.error("プリセットの保存に失敗:", error);
    return { success: false, error: error as Error };
  }
};

// プリセットを読み込み
export const loadPresets = async (): Promise<StorageResult<Preset[]>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PRESETS);
    return { success: true, data: data ? (JSON.parse(data) as Preset[]) : [] };
  } catch (error) {
    console.error("プリセットの読み込みに失敗:", error);
    return { success: false, error: error as Error, data: [] };
  }
};

// 通知マッピングを保存
export const saveNotificationMap = async (
  notificationMap: NotificationMap
): Promise<StorageSaveResult> => {
  try {
    const serialized: SerializedNotificationMap =
      Object.fromEntries(notificationMap);
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_MAP,
      JSON.stringify(serialized)
    );
    return { success: true };
  } catch (error) {
    console.error("通知マッピングの保存に失敗:", error);
    return { success: false, error: error as Error };
  }
};

// 通知マッピングを読み込み
export const loadNotificationMap = async (): Promise<
  StorageResult<NotificationMap>
> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_MAP);
    const parsed: SerializedNotificationMap = data ? JSON.parse(data) : {};
    return {
      success: true,
      data: new Map(Object.entries(parsed)),
    };
  } catch (error) {
    console.error("通知マッピングの読み込みに失敗:", error);
    return { success: false, error: error as Error, data: new Map() };
  }
};

// 全データをクリア（デバッグ用）
export const clearAllData = async (): Promise<StorageSaveResult> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PATIENTS,
      STORAGE_KEYS.PRESETS,
      STORAGE_KEYS.NOTIFICATION_MAP,
    ]);
    return { success: true };
  } catch (error) {
    console.error("データのクリアに失敗:", error);
    return { success: false, error: error as Error };
  }
};
