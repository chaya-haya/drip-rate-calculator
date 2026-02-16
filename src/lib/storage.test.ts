import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  savePatients,
  loadPatients,
  savePresets,
  loadPresets,
  saveNotificationMap,
  loadNotificationMap,
  clearAllData,
} from "./storage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import type { Patient } from "../types/patient";
import type { Preset } from "../types/preset";

beforeEach(() => {
  (AsyncStorage.clear as jest.Mock).mockClear();
  (AsyncStorage.setItem as jest.Mock).mockClear();
  (AsyncStorage.getItem as jest.Mock).mockClear();
  (AsyncStorage.multiRemove as jest.Mock).mockClear();
});

const mockPatient: Patient = {
  id: "patient-1",
  roomNumber: "101",
  bedNumber: "A",
  infusionSet: {
    id: "adult",
    name: "成人用",
    dropsPerMl: 20,
    description: "20滴/mL",
  },
  volume: "500",
  hours: "2",
  minutes: "0",
  isRunning: false,
  startedAt: null,
  endTime: null,
  notificationEnabled: false,
  notificationTiming: { id: "5", label: "5分前", minutes: 5 },
  hapticEnabled: false,
  hapticIntensity: "medium",
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
};

const mockPreset: Preset = {
  id: "preset-1",
  name: "生理食塩水 500mL/2h",
  infusionSet: {
    id: "adult",
    name: "成人用",
    dropsPerMl: 20,
    description: "20滴/mL",
  },
  volume: "500",
  hours: "2",
  minutes: "0",
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
};

describe("savePatients", () => {
  test("患者配列をAsyncStorageに保存する", async () => {
    const patients = [mockPatient];
    const result = await savePatients(patients);

    expect(result.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.PATIENTS,
      JSON.stringify(patients)
    );
  });

  test("空配列を保存できる", async () => {
    const result = await savePatients([]);

    expect(result.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.PATIENTS,
      "[]"
    );
  });

  test("保存失敗時にエラーを返す", async () => {
    const error = new Error("Storage full");
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(error);

    const result = await savePatients([mockPatient]);

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
  });
});

describe("loadPatients", () => {
  test("AsyncStorageから患者データを読み込む", async () => {
    const patients = [mockPatient];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(patients)
    );

    const result = await loadPatients();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(patients);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.PATIENTS);
  });

  test("データ未存在時は空配列を返す", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const result = await loadPatients();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  test("読み込み失敗時にエラーと空配列を返す", async () => {
    const error = new Error("Read error");
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(error);

    const result = await loadPatients();

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
    expect(result.data).toEqual([]);
  });
});

describe("savePresets", () => {
  test("プリセット配列をAsyncStorageに保存する", async () => {
    const presets = [mockPreset];
    const result = await savePresets(presets);

    expect(result.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.PRESETS,
      JSON.stringify(presets)
    );
  });

  test("保存失敗時にエラーを返す", async () => {
    const error = new Error("Storage full");
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(error);

    const result = await savePresets([mockPreset]);

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
  });
});

describe("loadPresets", () => {
  test("AsyncStorageからプリセットを読み込む", async () => {
    const presets = [mockPreset];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(presets)
    );

    const result = await loadPresets();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(presets);
  });

  test("データ未存在時は空配列を返す", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const result = await loadPresets();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  test("読み込み失敗時にエラーと空配列を返す", async () => {
    const error = new Error("Read error");
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(error);

    const result = await loadPresets();

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
    expect(result.data).toEqual([]);
  });
});

describe("saveNotificationMap", () => {
  test("MapをシリアライズしてAsyncStorageに保存する", async () => {
    const notificationMap = new Map([
      ["patient-1", "notification-abc"],
      ["patient-2", "notification-def"],
    ]);

    const result = await saveNotificationMap(notificationMap);

    expect(result.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.NOTIFICATION_MAP,
      JSON.stringify({
        "patient-1": "notification-abc",
        "patient-2": "notification-def",
      })
    );
  });

  test("空のMapを保存できる", async () => {
    const result = await saveNotificationMap(new Map());

    expect(result.success).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.NOTIFICATION_MAP,
      "{}"
    );
  });

  test("保存失敗時にエラーを返す", async () => {
    const error = new Error("Storage full");
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(error);

    const result = await saveNotificationMap(new Map());

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
  });
});

describe("loadNotificationMap", () => {
  test("通知マッピングを読み込みMapにデシリアライズする", async () => {
    const stored = {
      "patient-1": "notification-abc",
      "patient-2": "notification-def",
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(stored)
    );

    const result = await loadNotificationMap();

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Map);
    expect(result.data.get("patient-1")).toBe("notification-abc");
    expect(result.data.get("patient-2")).toBe("notification-def");
    expect(result.data.size).toBe(2);
  });

  test("データ未存在時は空のMapを返す", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const result = await loadNotificationMap();

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Map);
    expect(result.data.size).toBe(0);
  });

  test("読み込み失敗時にエラーと空Mapを返す", async () => {
    const error = new Error("Read error");
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(error);

    const result = await loadNotificationMap();

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
    expect(result.data).toBeInstanceOf(Map);
    expect(result.data.size).toBe(0);
  });
});

describe("clearAllData", () => {
  test("全ストレージキーを削除する", async () => {
    const result = await clearAllData();

    expect(result.success).toBe(true);
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      STORAGE_KEYS.PATIENTS,
      STORAGE_KEYS.PRESETS,
      STORAGE_KEYS.NOTIFICATION_MAP,
    ]);
  });

  test("削除失敗時にエラーを返す", async () => {
    const error = new Error("Remove failed");
    (AsyncStorage.multiRemove as jest.Mock).mockRejectedValueOnce(error);

    const result = await clearAllData();

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
  });
});
