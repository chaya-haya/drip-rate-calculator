// 通知マップ: patientId -> notificationId
export type NotificationMap = Map<string, string>;

// シリアライズ済み通知マップ（ストレージ保存用）
export type SerializedNotificationMap = Record<string, string>;
