// Watchに送信する患者データ
export interface WatchPatientData {
  id: string;
  roomNumber: string;
  bedNumber: string;
  infusionSetType: 'adult' | 'pediatric';
  dropsPerMl: number;
  volume: number;
  totalMinutes: number;
  isRunning: boolean;
  startedAt: string | null;
  endTime: string | null;
  dropsPerMinute: number;
  dropInterval: number;
  hapticEnabled: boolean;
}

// iPhoneからWatchへ送信するペイロード
export interface WatchSyncPayload {
  patients: WatchPatientData[];
  timestamp: number;
}

// WatchからiPhoneへ送信するコマンド
export interface WatchCommand {
  type: 'startInfusion' | 'stopInfusion' | 'requestSync';
  patientId: string;
  timestamp: number;
}

// メッセージ型
export type WatchMessage = WatchSyncPayload | WatchCommand;
