import type { Animated } from "react-native";
import type { InfusionSet, NotificationTimingOption } from "./infusion";

// 触覚フィードバックの強度
export type HapticIntensity = "light" | "medium" | "heavy";

export const HAPTIC_INTENSITY = {
  LIGHT: "light" as const,
  MEDIUM: "medium" as const,
  HEAVY: "heavy" as const,
};

// useCalculation フックの戻り値
export interface UseCalculationReturn {
  volume: string;
  setVolume: (value: string) => void;
  hours: string;
  setHours: (value: string) => void;
  minutes: string;
  setMinutes: (value: string) => void;
  infusionSet: InfusionSet;
  setInfusionSet: (set: InfusionSet) => void;
  totalMinutes: number;
  dropsPerMinute: number;
  dropInterval: number;
  totalDrops: number;
  endTime: Date | null;
  isValid: boolean;
  reset: () => void;
}

// useDripAnimation フックの戻り値
export interface UseDripAnimationReturn {
  dropPosition: Animated.Value;
  dropOpacity: Animated.Value;
  isAnimating: boolean;
  effectiveInterval: number;
}

// useNotification フックの戻り値
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
}
