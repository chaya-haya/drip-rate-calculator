import React from "react";
import { AppState } from "react-native";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { PatientsProvider, usePatients } from "./PatientsContext";
import { savePatients, loadPatients } from "../lib/storage";
import { PATIENT_STATUS, INFUSION_SETS } from "../constants/infusionSets";

jest.mock("../lib/storage", () => ({
  savePatients: jest.fn().mockResolvedValue({ success: true }),
  loadPatients: jest.fn().mockResolvedValue({ success: true, data: [] }),
}));

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "mock-uuid-1"),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PatientsProvider>{children}</PatientsProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  (loadPatients as jest.Mock).mockResolvedValue({ success: true, data: [] });
  // AppState.addEventListenerのデフォルトモック（removeを持つオブジェクトを返す）
  jest.spyOn(AppState, "addEventListener").mockReturnValue({
    remove: jest.fn(),
  } as any);
});

describe("PatientsContext", () => {
  describe("usePatients outside provider", () => {
    test("Provider外で使うとエラー", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => usePatients());
      }).toThrow("usePatients must be used within a PatientsProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("初期状態", () => {
    test("空の患者リストで開始", async () => {
      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.patients).toEqual([]);
    });

    test("マウント時にストレージから患者を読み込む", async () => {
      const storedPatients = [
        {
          id: "stored-1",
          roomNumber: "101",
          bedNumber: "A",
          infusionSet: INFUSION_SETS.ADULT,
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
        },
      ];
      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: storedPatients,
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.patients).toHaveLength(1);
      expect(result.current.patients[0].id).toBe("stored-1");
    });
  });

  describe("addPatient", () => {
    test("新しい患者を追加", async () => {
      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newPatient: any;
      await act(async () => {
        newPatient = await result.current.addPatient({
          roomNumber: "201",
          bedNumber: "B",
          volume: "1000",
        });
      });

      expect(newPatient.roomNumber).toBe("201");
      expect(newPatient.bedNumber).toBe("B");
      expect(newPatient.volume).toBe("1000");
      expect(result.current.patients).toHaveLength(1);
      expect(savePatients).toHaveBeenCalled();
    });

    test("デフォルト値が設定される", async () => {
      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newPatient: any;
      await act(async () => {
        newPatient = await result.current.addPatient({});
      });

      expect(newPatient.roomNumber).toBe("");
      expect(newPatient.isRunning).toBe(false);
      expect(newPatient.infusionSet).toEqual(INFUSION_SETS.ADULT);
    });
  });

  describe("deletePatient", () => {
    test("患者を削除", async () => {
      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "delete-me",
            roomNumber: "101",
            bedNumber: "A",
            infusionSet: INFUSION_SETS.ADULT,
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
          },
        ],
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.patients).toHaveLength(1);
      });

      await act(async () => {
        await result.current.deletePatient("delete-me");
      });

      expect(result.current.patients).toHaveLength(0);
      expect(savePatients).toHaveBeenCalled();
    });
  });

  describe("getPatient", () => {
    test("ステータス付きで患者を取得", async () => {
      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "find-me",
            roomNumber: "101",
            bedNumber: "A",
            infusionSet: INFUSION_SETS.ADULT,
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
          },
        ],
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.patients).toHaveLength(1);
      });

      const patient = result.current.getPatient("find-me");

      expect(patient).toBeDefined();
      expect(patient!.status).toEqual(PATIENT_STATUS.WAITING);
      expect(patient!.remainingTime).toBeNull();
    });

    test("存在しないIDはundefined", async () => {
      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getPatient("nonexistent")).toBeUndefined();
    });
  });

  describe("患者ステータス計算", () => {
    test("待機中の患者はWAITINGステータス", async () => {
      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "p1",
            roomNumber: "101",
            bedNumber: "A",
            infusionSet: INFUSION_SETS.ADULT,
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
          },
        ],
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.patients).toHaveLength(1);
      });

      expect(result.current.patients[0].status).toEqual(PATIENT_STATUS.WAITING);
    });

    test("終了済み患者はCOMPLETEDステータス", async () => {
      const pastEndTime = new Date(Date.now() - 60000).toISOString();
      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "p1",
            roomNumber: "101",
            bedNumber: "A",
            infusionSet: INFUSION_SETS.ADULT,
            volume: "500",
            hours: "2",
            minutes: "0",
            isRunning: true,
            startedAt: "2024-01-15T08:00:00.000Z",
            endTime: pastEndTime,
            notificationEnabled: false,
            notificationTiming: { id: "5", label: "5分前", minutes: 5 },
            hapticEnabled: false,
            hapticIntensity: "medium",
            createdAt: "2024-01-15T08:00:00.000Z",
            updatedAt: "2024-01-15T08:00:00.000Z",
          },
        ],
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.patients).toHaveLength(1);
      });

      expect(result.current.patients[0].status).toEqual(PATIENT_STATUS.COMPLETED);
    });

    test("残り5分以上の実行中患者はRUNNINGステータス", async () => {
      const futureEndTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "p1",
            roomNumber: "101",
            bedNumber: "A",
            infusionSet: INFUSION_SETS.ADULT,
            volume: "500",
            hours: "2",
            minutes: "0",
            isRunning: true,
            startedAt: "2024-01-15T10:00:00.000Z",
            endTime: futureEndTime,
            notificationEnabled: false,
            notificationTiming: { id: "5", label: "5分前", minutes: 5 },
            hapticEnabled: false,
            hapticIntensity: "medium",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.patients).toHaveLength(1);
      });

      expect(result.current.patients[0].status).toEqual(PATIENT_STATUS.RUNNING);
    });

    test("残り5分未満の患者はENDING_SOONステータス", async () => {
      const soonEndTime = new Date(Date.now() + 2 * 60 * 1000).toISOString();
      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "p1",
            roomNumber: "101",
            bedNumber: "A",
            infusionSet: INFUSION_SETS.ADULT,
            volume: "500",
            hours: "2",
            minutes: "0",
            isRunning: true,
            startedAt: "2024-01-15T10:00:00.000Z",
            endTime: soonEndTime,
            notificationEnabled: false,
            notificationTiming: { id: "5", label: "5分前", minutes: 5 },
            hapticEnabled: false,
            hapticIntensity: "medium",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.patients).toHaveLength(1);
      });

      expect(result.current.patients[0].status).toEqual(PATIENT_STATUS.ENDING_SOON);
    });
  });

  describe("AppState復帰時のステータス再計算", () => {
    test("フォアグラウンド復帰で終了済み患者のステータスがCOMPLETEDに更新される", async () => {
      // AppStateのaddEventListenerをスパイしてコールバックをキャプチャ
      let appStateCallback: ((state: string) => void) | null = null;
      const removeSpy = jest.fn();
      const addEventListenerSpy = jest
        .spyOn(AppState, "addEventListener")
        .mockImplementation((event: string, callback: any) => {
          if (event === "change") {
            appStateCallback = callback;
          }
          return { remove: removeSpy } as any;
        });

      // 最初は未来のendTimeで投与中
      const realNow = Date.now();
      const futureEndTime = new Date(realNow + 30 * 60 * 1000).toISOString();
      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "p1",
            roomNumber: "101",
            bedNumber: "A",
            infusionSet: INFUSION_SETS.ADULT,
            volume: "500",
            hours: "0",
            minutes: "30",
            isRunning: true,
            startedAt: new Date(realNow).toISOString(),
            endTime: futureEndTime,
            notificationEnabled: false,
            notificationTiming: { id: "5", label: "5分前", minutes: 5 },
            hapticEnabled: false,
            hapticIntensity: "medium",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.patients).toHaveLength(1);
      });

      // 初期状態はRUNNING
      expect(result.current.patients[0].status).toEqual(PATIENT_STATUS.RUNNING);
      expect(appStateCallback).not.toBeNull();

      // Date コンストラクタをモックして未来の時刻を返す
      const futureTime = new Date(futureEndTime).getTime() + 60000;
      const OriginalDate = global.Date;
      const mockDate = class extends OriginalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(futureTime);
          } else {
            // @ts-ignore
            super(...args);
          }
        }

        static now() {
          return futureTime;
        }
      } as any;
      global.Date = mockDate;

      // AppState 'active' イベントを発火
      await act(async () => {
        appStateCallback!("active");
      });

      // ステータスがCOMPLETEDに更新される
      expect(result.current.patients[0].status).toEqual(PATIENT_STATUS.COMPLETED);

      // モックをリストア
      global.Date = OriginalDate;
      addEventListenerSpy.mockRestore();
    });

    test("30秒タイマーでステータスが再計算される", async () => {
      jest.useFakeTimers();

      const futureEndTime = new Date(Date.now() + 10 * 1000).toISOString(); // 10秒後

      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "p1",
            roomNumber: "101",
            bedNumber: "A",
            infusionSet: INFUSION_SETS.ADULT,
            volume: "500",
            hours: "0",
            minutes: "1",
            isRunning: true,
            startedAt: new Date().toISOString(),
            endTime: futureEndTime,
            notificationEnabled: false,
            notificationTiming: { id: "5", label: "5分前", minutes: 5 },
            hapticEnabled: false,
            hapticIntensity: "medium",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.patients).toHaveLength(1);
      });

      // 30秒タイマーを進める（endTimeを超える時刻に）
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      // endTimeが過去になったのでCOMPLETEDになる
      expect(result.current.patients[0].status).toEqual(PATIENT_STATUS.COMPLETED);

      jest.useRealTimers();
    });
  });

  describe("startPatient / stopPatient", () => {
    test("startPatientでisRunningとendTimeが設定される", async () => {
      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "start-me",
            roomNumber: "101",
            bedNumber: "A",
            infusionSet: INFUSION_SETS.ADULT,
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
          },
        ],
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.patients).toHaveLength(1);
      });

      const endTime = new Date("2024-01-15T12:00:00");
      await act(async () => {
        await result.current.startPatient("start-me", endTime);
      });

      expect(result.current.patients[0].isRunning).toBe(true);
      expect(result.current.patients[0].endTime).toBe(endTime.toISOString());
    });

    test("stopPatientでisRunningとendTimeがクリアされる", async () => {
      (loadPatients as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "stop-me",
            roomNumber: "101",
            bedNumber: "A",
            infusionSet: INFUSION_SETS.ADULT,
            volume: "500",
            hours: "2",
            minutes: "0",
            isRunning: true,
            startedAt: "2024-01-15T10:00:00.000Z",
            endTime: "2024-01-15T12:00:00.000Z",
            notificationEnabled: false,
            notificationTiming: { id: "5", label: "5分前", minutes: 5 },
            hapticEnabled: false,
            hapticIntensity: "medium",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
      });

      const { result } = renderHook(() => usePatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.patients).toHaveLength(1);
      });

      await act(async () => {
        await result.current.stopPatient("stop-me");
      });

      expect(result.current.patients[0].isRunning).toBe(false);
      expect(result.current.patients[0].startedAt).toBeNull();
      expect(result.current.patients[0].endTime).toBeNull();
    });
  });
});
