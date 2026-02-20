import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  requestNotificationPermission,
  schedulePatientNotification,
  cancelNotification,
  cancelAllNotifications,
} from "../lib/notification";
import { saveNotificationMap, loadNotificationMap } from "../lib/storage";
import type { NotificationMap } from "../types";
import type { NotificationContextValue } from "../types/context";

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // 患者ID → 通知ID のマッピング
  const [notificationMap, setNotificationMap] = useState<NotificationMap>(new Map());
  const [hasPermission, setHasPermission] = useState(false);

  // 初期化
  useEffect(() => {
    const init = async () => {
      const permission = await requestNotificationPermission();
      setHasPermission(permission);

      const result = await loadNotificationMap();
      if (result.success) {
        setNotificationMap(result.data);
      }
    };
    init();
  }, []);

  // 患者の通知をスケジュール
  const scheduleForPatient = useCallback(
    async (
      patientId: string,
      endTime: Date,
      timingMinutes: number
    ): Promise<string | null> => {
      // 既存の通知をキャンセル
      const existingId = notificationMap.get(patientId);
      if (existingId) {
        await cancelNotification(existingId);
      }

      if (!hasPermission) {
        const granted = await requestNotificationPermission();
        setHasPermission(granted);
        if (!granted) {
          return null;
        }
      }

      const notificationId = await schedulePatientNotification(
        patientId,
        endTime,
        timingMinutes
      );

      if (notificationId) {
        const newMap = new Map(notificationMap);
        newMap.set(patientId, notificationId);
        setNotificationMap(newMap);
        await saveNotificationMap(newMap);
      }

      return notificationId;
    },
    [notificationMap, hasPermission]
  );

  // 患者の通知をキャンセル
  const cancelForPatient = useCallback(
    async (patientId: string): Promise<void> => {
      const notificationId = notificationMap.get(patientId);
      if (notificationId) {
        await cancelNotification(notificationId);

        const newMap = new Map(notificationMap);
        newMap.delete(patientId);
        setNotificationMap(newMap);
        await saveNotificationMap(newMap);
      }
    },
    [notificationMap]
  );

  // 全通知をキャンセル
  const cancelAll = useCallback(async (): Promise<void> => {
    await cancelAllNotifications();
    setNotificationMap(new Map());
    await saveNotificationMap(new Map());
  }, []);

  // 患者の通知がスケジュール済みか確認
  const isScheduledForPatient = useCallback(
    (patientId: string): boolean => {
      return notificationMap.has(patientId);
    },
    [notificationMap]
  );

  const value: NotificationContextValue = {
    hasPermission,
    scheduleForPatient,
    cancelForPatient,
    cancelAll,
    isScheduledForPatient,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
