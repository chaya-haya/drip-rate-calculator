import * as Notifications from "expo-notifications";
import { logger } from "../../lib/logger";

// 通知の表示設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 通知権限をリクエスト
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    logger.warn("通知権限の取得に失敗:", error);
    return false;
  }
};

// 現在の通知権限を確認（ダイアログは表示しない）
export const getNotificationPermissionStatus = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  } catch (error) {
    logger.warn("通知権限の確認に失敗:", error);
    return false;
  }
};

// 患者通知をスケジュール
export const schedulePatientNotification = async (
  patientId: string,
  endTime: Date,
  timingMinutes: number
): Promise<string | null> => {
  try {
    // 通知時刻を計算（終了X分前）
    const notificationTime = new Date(endTime.getTime() - timingMinutes * 60 * 1000);
    const now = new Date();

    // 通知時刻が過去の場合はスケジュールしない
    if (notificationTime <= now) {
      logger.warn("通知時刻が過去です");
      return null;
    }

    // 通知までの秒数
    const secondsUntilNotification = Math.floor(
      (notificationTime.getTime() - now.getTime()) / 1000
    );

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "点滴終了のお知らせ",
        body: `点滴終了まであと${timingMinutes}分です`,
        sound: true,
        data: { patientId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilNotification,
      },
    });

    return id;
  } catch (error) {
    logger.warn("通知のスケジュールに失敗:", error);
    return null;
  }
};

// 特定の通知をキャンセル
export const cancelNotification = async (notificationId: string | null): Promise<void> => {
  try {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  } catch (error) {
    logger.warn("通知のキャンセルに失敗:", error);
  }
};

// 全通知をキャンセル
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    logger.warn("通知のキャンセルに失敗:", error);
  }
};

// スケジュール済み通知を取得
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    logger.warn("スケジュール済み通知の取得に失敗:", error);
    return [];
  }
};
