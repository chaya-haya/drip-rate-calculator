import { useState, useEffect, useCallback } from "react";
import * as Notifications from "expo-notifications";
import { NOTIFICATION_TIMING_OPTIONS } from "../constants/infusionSets";
import type { NotificationTimingOption } from "../types/infusion";

// 通知表示の設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface UseNotificationReturn {
  isEnabled: boolean;
  selectedTiming: NotificationTimingOption;
  hasPermission: boolean;
  scheduledNotificationId: string | null;
  toggleNotification: (enabled: boolean, endTime?: Date) => Promise<void>;
  updateTiming: (
    timing: NotificationTimingOption,
    endTime?: Date
  ) => Promise<void>;
  cancelNotification: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

/**
 * 通知管理フック
 */
export const useNotification = (): UseNotificationReturn => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedTiming, setSelectedTiming] =
    useState<NotificationTimingOption>(NOTIFICATION_TIMING_OPTIONS[0]);
  const [scheduledNotificationId, setScheduledNotificationId] = useState<
    string | null
  >(null);
  const [hasPermission, setHasPermission] = useState(false);

  // 通知権限のリクエスト
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setHasPermission(finalStatus === "granted");
      return finalStatus === "granted";
    } catch {
      setHasPermission(false);
      return false;
    }
  }, []);

  // 初期化時に権限を確認
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // 通知をスケジュール
  const scheduleNotification = useCallback(
    async (endTime: Date, timingMinutes: number): Promise<string | null> => {
      try {
        // 既存の通知をキャンセル
        if (scheduledNotificationId) {
          await Notifications.cancelScheduledNotificationAsync(
            scheduledNotificationId
          );
        }

        if (!hasPermission) {
          const granted = await requestPermission();
          if (!granted) {
            return null;
          }
        }

        // 通知時刻の計算（終了時刻のX分前）
        const notificationTime = new Date(
          endTime.getTime() - timingMinutes * 60 * 1000
        );
        const now = new Date();

        // 通知時刻が過去なら通知しない
        if (notificationTime <= now) {
          return null;
        }

        // 通知までの秒数を計算
        const secondsUntilNotification = Math.floor(
          (notificationTime.getTime() - now.getTime()) / 1000
        );

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "点滴終了のお知らせ",
            body: `点滴終了まであと${timingMinutes}分です`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsUntilNotification,
          },
        });

        setScheduledNotificationId(id);
        return id;
      } catch {
        return null;
      }
    },
    [scheduledNotificationId, hasPermission, requestPermission]
  );

  // 通知をキャンセル
  const cancelNotification = useCallback(async (): Promise<void> => {
    try {
      if (scheduledNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          scheduledNotificationId
        );
        setScheduledNotificationId(null);
      }
    } catch {
      // キャンセル失敗は無視
    }
  }, [scheduledNotificationId]);

  // 全通知をキャンセル
  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setScheduledNotificationId(null);
    } catch {
      // キャンセル失敗は無視
    }
  }, []);

  // 通知のオン/オフ切り替え
  const toggleNotification = useCallback(
    async (enabled: boolean, endTime?: Date): Promise<void> => {
      setIsEnabled(enabled);

      if (enabled && endTime) {
        await scheduleNotification(endTime, selectedTiming.minutes);
      } else {
        await cancelNotification();
      }
    },
    [selectedTiming, scheduleNotification, cancelNotification]
  );

  // タイミング更新（有効中はリスケジュール）
  const updateTiming = useCallback(
    async (
      timing: NotificationTimingOption,
      endTime?: Date
    ): Promise<void> => {
      setSelectedTiming(timing);

      if (isEnabled && endTime) {
        await scheduleNotification(endTime, timing.minutes);
      }
    },
    [isEnabled, scheduleNotification]
  );

  return {
    isEnabled,
    selectedTiming,
    hasPermission,
    scheduledNotificationId,
    toggleNotification,
    updateTiming,
    cancelNotification,
    cancelAllNotifications,
    requestPermission,
  };
};
