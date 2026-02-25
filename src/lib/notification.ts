// 後方互換のため再エクスポート（実体は features/notification/logic.ts）
export {
  requestNotificationPermission,
  schedulePatientNotification,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
} from "../features/notification/logic";
