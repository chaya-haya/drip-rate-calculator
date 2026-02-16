import { useState, useMemo, useCallback } from "react";
import {
  calculateDropsPerMinute,
  hoursToMinutes,
  calculateDropInterval,
  calculateTotalDrops,
  calculateEndTime,
} from "../logic";
import {
  INFUSION_SETS,
  INPUT_LIMITS,
  ANIMATION_CONFIG,
} from "../../../constants/infusionSets";
import type { InfusionSet } from "../../../types";

export interface UseCalculationReturn {
  // 入力値
  volume: string;
  setVolume: (value: string) => void;
  hours: string;
  setHours: (value: string) => void;
  minutes: string;
  setMinutes: (value: string) => void;
  infusionSet: InfusionSet;
  setInfusionSet: (set: InfusionSet) => void;
  // 計算値
  totalMinutes: number;
  dropsPerMinute: number;
  dropInterval: number;
  totalDrops: number;
  endTime: Date | null;
  isValid: boolean;
  validationError: string | null;
  // アクション
  reset: () => void;
}

// 点滴計算フック
export const useCalculation = (): UseCalculationReturn => {
  const [volume, setVolume] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [infusionSet, setInfusionSet] = useState<InfusionSet>(
    INFUSION_SETS.ADULT
  );

  // 入力値を数値に変換
  const volumeNum = parseFloat(volume) || 0;
  const hoursNum = parseInt(hours, 10) || 0;
  const minutesNum = parseInt(minutes, 10) || 0;

  // 総投与時間（分）
  const totalMinutes = useMemo(() => {
    return hoursToMinutes(hoursNum, minutesNum);
  }, [hoursNum, minutesNum]);

  // 滴下数/分
  const dropsPerMinute = useMemo(() => {
    return calculateDropsPerMinute(
      volumeNum,
      totalMinutes,
      infusionSet.dropsPerMl
    );
  }, [volumeNum, totalMinutes, infusionSet.dropsPerMl]);

  // 滴下間隔（ミリ秒）
  const dropInterval = useMemo(() => {
    return calculateDropInterval(dropsPerMinute);
  }, [dropsPerMinute]);

  // 総滴下数
  const totalDrops = useMemo(() => {
    return calculateTotalDrops(volumeNum, infusionSet.dropsPerMl);
  }, [volumeNum, infusionSet.dropsPerMl]);

  // 終了予定時刻
  const endTime = useMemo(() => {
    if (totalMinutes <= 0) return null;
    return calculateEndTime(totalMinutes);
  }, [totalMinutes]);

  // バリデーションエラーメッセージ
  const validationError = useMemo((): string | null => {
    if (volumeNum === 0 && totalMinutes === 0) return null;

    if (volumeNum > INPUT_LIMITS.MAX_VOLUME_ML) {
      return `輸液量は${INPUT_LIMITS.MAX_VOLUME_ML} mL以下にしてください`;
    }
    if (totalMinutes > 0 && totalMinutes < INPUT_LIMITS.MIN_TOTAL_MINUTES) {
      return `投与時間は${INPUT_LIMITS.MIN_TOTAL_MINUTES}分以上にしてください`;
    }
    if (totalMinutes > INPUT_LIMITS.MAX_TOTAL_MINUTES) {
      return `投与時間は${INPUT_LIMITS.MAX_TOTAL_MINUTES / 60}時間以下にしてください`;
    }
    if (
      volumeNum > 0 &&
      totalMinutes > 0 &&
      dropsPerMinute > ANIMATION_CONFIG.MAX_DROPS_PER_MINUTE
    ) {
      return `滴下速度が${ANIMATION_CONFIG.MAX_DROPS_PER_MINUTE}滴/分を超えています。輸液量を減らすか投与時間を延ばしてください`;
    }
    return null;
  }, [volumeNum, totalMinutes, dropsPerMinute]);

  // 入力が有効かどうか
  const isValid = useMemo(() => {
    return volumeNum > 0 && totalMinutes > 0 && validationError === null;
  }, [volumeNum, totalMinutes, validationError]);

  // 全入力をリセット
  const reset = useCallback(() => {
    setVolume("");
    setHours("");
    setMinutes("");
    setInfusionSet(INFUSION_SETS.ADULT);
  }, []);

  return {
    volume,
    setVolume,
    hours,
    setHours,
    minutes,
    setMinutes,
    infusionSet,
    setInfusionSet,
    totalMinutes,
    dropsPerMinute,
    dropInterval,
    totalDrops,
    endTime,
    isValid,
    validationError,
    reset,
  };
};
