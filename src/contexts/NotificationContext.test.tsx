import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { NotificationProvider, useNotifications } from "./NotificationContext";
import {
  requestNotificationPermission,
  schedulePatientNotification,
  cancelNotification,
  cancelAllNotifications,
} from "../lib/notification";
import { saveNotificationMap, loadNotificationMap } from "../lib/storage";

jest.mock("../lib/notification", () => ({
  requestNotificationPermission: jest.fn().mockResolvedValue(true),
  schedulePatientNotification: jest.fn().mockResolvedValue("notif-123"),
  cancelNotification: jest.fn().mockResolvedValue(undefined),
  cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../lib/storage", () => ({
  saveNotificationMap: jest.fn().mockResolvedValue({ success: true }),
  loadNotificationMap: jest.fn().mockResolvedValue({ success: true, data: new Map() }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  (requestNotificationPermission as jest.Mock).mockResolvedValue(true);
  (loadNotificationMap as jest.Mock).mockResolvedValue({
    success: true,
    data: new Map(),
  });
  (schedulePatientNotification as jest.Mock).mockResolvedValue("notif-123");
});

describe("NotificationContext", () => {
  describe("useNotifications outside provider", () => {
    test("Provider外で使うとエラー", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useNotifications());
      }).toThrow("useNotifications must be used within a NotificationProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("初期化", () => {
    test("マウント時に権限をリクエスト", async () => {
      renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(requestNotificationPermission).toHaveBeenCalled();
      });
    });

    test("ストレージから通知マップを読み込む", async () => {
      renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(loadNotificationMap).toHaveBeenCalled();
      });
    });

    test("権限結果に応じてhasPermissionが設定される", async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });
    });

    test("権限拒否時はhasPermissionがfalse", async () => {
      (requestNotificationPermission as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });
    });
  });

  describe("scheduleForPatient", () => {
    test("通知をスケジュールしてマッピングを保存", async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      const endTime = new Date("2024-01-15T12:00:00");
      let notifId: string | null;

      await act(async () => {
        notifId = await result.current.scheduleForPatient("patient-1", endTime, 5);
      });

      expect(notifId!).toBe("notif-123");
      expect(schedulePatientNotification).toHaveBeenCalledWith("patient-1", endTime, 5);
      expect(saveNotificationMap).toHaveBeenCalled();
      expect(result.current.isScheduledForPatient("patient-1")).toBe(true);
    });

    test("既存の通知をキャンセルしてから新しい通知をスケジュール", async () => {
      (loadNotificationMap as jest.Mock).mockResolvedValue({
        success: true,
        data: new Map([["patient-1", "old-notif"]]),
      });

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      const endTime = new Date("2024-01-15T12:00:00");
      await act(async () => {
        await result.current.scheduleForPatient("patient-1", endTime, 5);
      });

      expect(cancelNotification).toHaveBeenCalledWith("old-notif");
    });
  });

  describe("cancelForPatient", () => {
    test("通知をキャンセルしてマップから削除", async () => {
      (loadNotificationMap as jest.Mock).mockResolvedValue({
        success: true,
        data: new Map([["patient-1", "notif-to-cancel"]]),
      });

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.isScheduledForPatient("patient-1")).toBe(true);
      });

      await act(async () => {
        await result.current.cancelForPatient("patient-1");
      });

      expect(cancelNotification).toHaveBeenCalledWith("notif-to-cancel");
      expect(result.current.isScheduledForPatient("patient-1")).toBe(false);
      expect(saveNotificationMap).toHaveBeenCalled();
    });

    test("通知がない患者に対しては何もしない", async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await act(async () => {
        await result.current.cancelForPatient("no-notif");
      });

      expect(cancelNotification).not.toHaveBeenCalled();
    });
  });

  describe("cancelAll", () => {
    test("全通知をキャンセルしてマップをクリア", async () => {
      (loadNotificationMap as jest.Mock).mockResolvedValue({
        success: true,
        data: new Map([
          ["patient-1", "notif-1"],
          ["patient-2", "notif-2"],
        ]),
      });

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await act(async () => {
        await result.current.cancelAll();
      });

      expect(cancelAllNotifications).toHaveBeenCalled();
      expect(result.current.isScheduledForPatient("patient-1")).toBe(false);
      expect(result.current.isScheduledForPatient("patient-2")).toBe(false);
      expect(saveNotificationMap).toHaveBeenCalled();
    });
  });

  describe("isScheduledForPatient", () => {
    test("通知がスケジュール済みの患者にはtrueを返す", async () => {
      (loadNotificationMap as jest.Mock).mockResolvedValue({
        success: true,
        data: new Map([["patient-1", "notif-1"]]),
      });

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.isScheduledForPatient("patient-1")).toBe(true);
      });
    });

    test("通知がない患者にはfalseを返す", async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      expect(result.current.isScheduledForPatient("no-notif")).toBe(false);
    });
  });
});
