import { renderHook, act } from "@testing-library/react-native";
import * as Notifications from "expo-notifications";
import { useNotification } from "./useNotification";

// expo-notificationsのモック
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("notif-123"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
    status: "granted",
  });
  (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
    status: "granted",
  });
  (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
    "notif-123"
  );
});

describe("useNotification", () => {
  describe("初期状態", () => {
    test("通知が無効状態で始まる", async () => {
      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      expect(result.current.isEnabled).toBe(false);
      expect(result.current.scheduledNotificationId).toBeNull();
    });

    test("マウント時に権限チェックを行う", async () => {
      renderHook(() => useNotification());
      await act(async () => {});

      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    });

    test("権限が付与済みならhasPermissionがtrueになる", async () => {
      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      expect(result.current.hasPermission).toBe(true);
    });

    test("デフォルトのタイミングオプションを持つ（5分前）", async () => {
      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      expect(result.current.selectedTiming).toEqual({
        id: "5",
        label: "5分前",
        minutes: 5,
      });
    });
  });

  describe("権限リクエスト", () => {
    test("未付与の場合に権限をリクエストする", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "undetermined",
      });

      renderHook(() => useNotification());
      await act(async () => {});

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    test("権限が拒否された場合hasPermissionがfalseになる", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "undetermined",
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "denied",
      });

      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      expect(result.current.hasPermission).toBe(false);
    });
  });

  describe("toggleNotification", () => {
    test("有効化時にendTimeがあれば通知をスケジュールする", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-15T10:00:00"));

      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      const endTime = new Date("2024-01-15T12:00:00");
      await act(async () => {
        await result.current.toggleNotification(true, endTime);
      });

      expect(result.current.isEnabled).toBe(true);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      expect(result.current.scheduledNotificationId).toBe("notif-123");

      jest.useRealTimers();
    });

    test("無効化時に通知をキャンセルする", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-15T10:00:00"));

      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      // まず有効化
      const endTime = new Date("2024-01-15T12:00:00");
      await act(async () => {
        await result.current.toggleNotification(true, endTime);
      });

      // 無効化
      await act(async () => {
        await result.current.toggleNotification(false);
      });

      expect(result.current.isEnabled).toBe(false);

      jest.useRealTimers();
    });

    test("endTimeなしで有効化した場合スケジュールしない", async () => {
      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      await act(async () => {
        await result.current.toggleNotification(true);
      });

      expect(result.current.isEnabled).toBe(true);
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe("updateTiming", () => {
    test("タイミングを更新する", async () => {
      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      const newTiming = { id: "10", label: "10分前", minutes: 10 };
      await act(async () => {
        await result.current.updateTiming(newTiming);
      });

      expect(result.current.selectedTiming).toEqual(newTiming);
    });

    test("有効中にタイミング変更するとリスケジュールする", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-15T10:00:00"));

      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      // まず有効化
      const endTime = new Date("2024-01-15T12:00:00");
      await act(async () => {
        await result.current.toggleNotification(true, endTime);
      });

      (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();

      // タイミング変更
      const newTiming = { id: "10", label: "10分前", minutes: 10 };
      await act(async () => {
        await result.current.updateTiming(newTiming, endTime);
      });

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe("cancelNotification", () => {
    test("スケジュール済み通知をキャンセルする", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-15T10:00:00"));

      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      // まずスケジュール
      const endTime = new Date("2024-01-15T12:00:00");
      await act(async () => {
        await result.current.toggleNotification(true, endTime);
      });

      // キャンセル
      await act(async () => {
        await result.current.cancelNotification();
      });

      expect(
        Notifications.cancelScheduledNotificationAsync
      ).toHaveBeenCalledWith("notif-123");
      expect(result.current.scheduledNotificationId).toBeNull();

      jest.useRealTimers();
    });

    test("未スケジュール時は何もしない", async () => {
      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      await act(async () => {
        await result.current.cancelNotification();
      });

      expect(
        Notifications.cancelScheduledNotificationAsync
      ).not.toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    test("権限取得エラー時にhasPermissionがfalseになる", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error("Permission error")
      );

      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      expect(result.current.hasPermission).toBe(false);
    });

    test("スケジュールエラー時にクラッシュしない", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-15T10:00:00"));

      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error("Schedule error")
      );

      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      const endTime = new Date("2024-01-15T12:00:00");
      await act(async () => {
        await result.current.toggleNotification(true, endTime);
      });

      // クラッシュせず、IDはnullのまま
      expect(result.current.scheduledNotificationId).toBeNull();

      jest.useRealTimers();
    });
  });

  describe("通知時刻の境界", () => {
    test("通知時刻が過去の場合はスケジュールしない", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-15T12:00:00"));

      const { result } = renderHook(() => useNotification());
      await act(async () => {});

      // 終了時刻が現在時刻の3分後、タイミングが5分前 → 通知時刻は過去
      const endTime = new Date("2024-01-15T12:03:00");
      await act(async () => {
        await result.current.toggleNotification(true, endTime);
      });

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});
