import type {
  InfusionSet,
  InfusionSets,
  NotificationTimingOption,
  AnimationConfig,
  InputLimits,
  PatientStatuses,
} from "../types";

// 輸液セット定数
export const INFUSION_SETS: InfusionSets = {
  ADULT: {
    id: "adult",
    name: "成人用",
    dropsPerMl: 20,
    description: "20滴/mL",
  },
  PEDIATRIC: {
    id: "pediatric",
    name: "小児用",
    dropsPerMl: 60,
    description: "60滴/mL",
  },
};

export const INFUSION_SET_LIST: InfusionSet[] = Object.values(INFUSION_SETS);

// 通知タイミング選択肢（終了N分前）
export const NOTIFICATION_TIMING_OPTIONS: NotificationTimingOption[] = [
  { id: "5", label: "5分前", minutes: 5 },
  { id: "10", label: "10分前", minutes: 10 },
  { id: "15", label: "15分前", minutes: 15 },
];

// アニメーション制約
export const ANIMATION_CONFIG: AnimationConfig = {
  MIN_INTERVAL_MS: 200,
  MAX_DROPS_PER_MINUTE: 300,
};

// 臨床安全のための入力制限
export const INPUT_LIMITS: InputLimits = {
  MAX_VOLUME_ML: 3000,
  MIN_TOTAL_MINUTES: 15,
  MAX_TOTAL_MINUTES: 1440, // 24時間
  MAX_HOURS: 24,
  MAX_MINUTES: 59,
};

// 患者ステータス定義
export const PATIENT_STATUS: PatientStatuses = {
  WAITING: { id: "waiting", label: "待機中", color: "#9E9E9E" },
  RUNNING: { id: "running", label: "実行中", color: "#4CAF50" },
  ENDING_SOON: { id: "ending_soon", label: "終了間近", color: "#FF9800" },
  COMPLETED: { id: "completed", label: "完了", color: "#2196F3" },
};
