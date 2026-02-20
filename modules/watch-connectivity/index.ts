export {
  isWatchConnected,
  isPaired,
  isWatchAppInstalled,
  sendMessage,
  updateApplicationContext,
  transferUserInfo,
  addMessageListener,
  removeMessageListener,
} from "./src/WatchConnectivityModule";

export type {
  WatchMessage,
  WatchCommand,
  WatchPatientData,
  WatchSyncPayload,
} from "./src/WatchConnectivityModule.types";
