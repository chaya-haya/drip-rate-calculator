import * as Notifications from "expo-notifications";
import {
  requestNotificationPermission,
  schedulePatientNotification,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
} from "./logic";

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("requestNotificationPermission", () => {
  test("既に許可済みの場合trueを返す", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    });

    const result = await requestNotificationPermission();

    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  test("未許可の場合に権限をリクエストする", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "undetermined",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    });

    const result = await requestNotificationPermission();

    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  test("拒否された場合falseを返す", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "undetermined",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "denied",
    });

    const result = await requestNotificationPermission();

    expect(result).toBe(false);
  });

  test("エラー発生時falseを返す", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(
      new Error("Permission error")
    );

    const result = await requestNotificationPermission();

    expect(result).toBe(false);
  });
});

describe("schedulePatientNotification", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T10:00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("未来の時刻に通知をスケジュールする", async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce("notif-123");

    const endTime = new Date("2024-01-15T12:00:00");
    const result = await schedulePatientNotification("patient-1", endTime, 5);

    expect(result).toBe("notif-123");
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: "点滴終了のお知らせ",
        body: "点滴終了まであと5分です",
        sound: true,
        data: { patientId: "patient-1" },
      },
      trigger: {
        type: "timeInterval",
        seconds: expect.any(Number),
      },
    });

    // 検証: endTime - 5分 - now = 115分 = 6900秒
    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(call.trigger.seconds).toBe(6900);
  });

  test("通知時刻が過去の場合nullを返す", async () => {
    const endTime = new Date("2024-01-15T10:03:00"); // 3分後、タイミングは5分前
    const result = await schedulePatientNotification("patient-1", endTime, 5);

    expect(result).toBeNull();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test("スケジュールエラー時nullを返す", async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
      new Error("Schedule failed")
    );

    const endTime = new Date("2024-01-15T12:00:00");
    const result = await schedulePatientNotification("patient-1", endTime, 5);

    expect(result).toBeNull();
  });
});

describe("cancelNotification", () => {
  test("IDで通知をキャンセルする", async () => {
    await cancelNotification("notif-123");

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("notif-123");
  });

  test("IDがnullの場合何もしない", async () => {
    await cancelNotification(null);

    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
  });

  test("キャンセルエラーを安全に処理する", async () => {
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockRejectedValueOnce(
      new Error("Cancel failed")
    );

    await expect(cancelNotification("notif-123")).resolves.toBeUndefined();
  });
});

describe("cancelAllNotifications", () => {
  test("全スケジュール通知をキャンセルする", async () => {
    await cancelAllNotifications();

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });

  test("エラーを安全に処理する", async () => {
    (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockRejectedValueOnce(
      new Error("Cancel failed")
    );

    await expect(cancelAllNotifications()).resolves.toBeUndefined();
  });
});

describe("getScheduledNotifications", () => {
  test("スケジュール済み通知のリストを返す", async () => {
    const mockNotifications = [
      { identifier: "notif-1", content: { title: "Test" }, trigger: null },
    ];
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce(
      mockNotifications
    );

    const result = await getScheduledNotifications();

    expect(result).toEqual(mockNotifications);
  });

  test("エラー時は空配列を返す", async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch failed")
    );

    const result = await getScheduledNotifications();

    expect(result).toEqual([]);
  });
});
