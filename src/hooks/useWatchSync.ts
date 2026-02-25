import { useEffect, useCallback, useRef } from "react";
import { logger } from "../lib/logger";
import { Platform } from "react-native";
import {
  updateApplicationContext,
  sendMessage,
  transferUserInfo,
  isWatchConnected,
  addMessageListener,
  removeMessageListener,
} from "../../modules/watch-connectivity";
import type { WatchCommand, WatchPatientData } from "../../modules/watch-connectivity";
import type { PatientWithStatus } from "../types";
import {
  calculateDropsPerMinute,
  hoursToMinutes,
  calculateDropInterval,
} from "../features/calculation/logic";

// WatchCommandの型ガード（不正データによるクラッシュ防止）
export const isWatchCommand = (msg: unknown): msg is WatchCommand => {
  if (typeof msg !== "object" || msg === null) return false;
  const obj = msg as Record<string, unknown>;
  return typeof obj.type === "string" && typeof obj.patientId === "string";
};

interface UseWatchSyncOptions {
  patients: PatientWithStatus[];
  startPatient: (id: string, endTime: Date) => Promise<void>;
  stopPatient: (id: string) => Promise<void>;
}

// 患者データをApple Watchと同期するフック
export const useWatchSync = ({
  patients,
  startPatient,
  stopPatient,
}: UseWatchSyncOptions): void => {
  const patientsRef = useRef(patients);
  patientsRef.current = patients;

  // PatientをWatchPatientDataに変換
  const toWatchData = useCallback((patient: PatientWithStatus): WatchPatientData => {
    const volumeNum = parseFloat(patient.volume) || 0;
    const hoursNum = parseInt(patient.hours, 10) || 0;
    const minutesNum = parseInt(patient.minutes, 10) || 0;
    const totalMinutes = hoursToMinutes(hoursNum, minutesNum);
    const dropsPerMinute = calculateDropsPerMinute(
      volumeNum,
      totalMinutes,
      patient.infusionSet.dropsPerMl
    );
    const dropInterval = calculateDropInterval(dropsPerMinute);

    // NSNull回避のためnull値を除外して構築
    const data: Record<string, unknown> = {
      id: patient.id,
      roomNumber: patient.roomNumber,
      bedNumber: patient.bedNumber,
      infusionSetType: patient.infusionSet.id as "adult" | "pediatric",
      dropsPerMl: patient.infusionSet.dropsPerMl,
      volume: volumeNum,
      totalMinutes,
      isRunning: patient.isRunning,
      dropsPerMinute,
      dropInterval,
      hapticEnabled: patient.hapticEnabled || false,
    };
    if (patient.startedAt != null) {
      data.startedAt = patient.startedAt;
    }
    if (patient.endTime != null) {
      data.endTime = patient.endTime;
    }
    return data as unknown as WatchPatientData;
  }, []);

  // 患者データをWatchに同期
  const syncToWatch = useCallback(async () => {
    if (Platform.OS !== "ios") return;

    const watchPatients = patientsRef.current.map(toWatchData);
    const payload = {
      patients: watchPatients,
      timestamp: Date.now() / 1000,
    };

    try {
      // 到達可能ならsendMessageで即時配信を試行
      const connected = await isWatchConnected();
      if (connected) {
        await sendMessage(payload as unknown as Record<string, unknown>);
        return;
      }
    } catch {
      // sendMessage失敗時はフォールバック
    }

    try {
      await updateApplicationContext(payload as unknown as Record<string, unknown>);
    } catch {
      // applicationContext失敗時はtransferUserInfoにフォールバック
      try {
        await transferUserInfo(payload as unknown as Record<string, unknown>);
      } catch (error) {
        logger.warn("[WatchSync] Failed to sync:", error);
      }
    }
  }, [toWatchData]);

  // 患者データ変更時に同期
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    syncToWatch();
  }, [patients, syncToWatch]);

  // Watchからのコマンドをリッスン
  useEffect(() => {
    if (Platform.OS !== "ios") return;

    const handleWatchMessage = async (message: unknown) => {
      if (!isWatchCommand(message)) return;
      const command = message;

      const patient = patientsRef.current.find((p) => p.id === command.patientId);

      switch (command.type) {
        case "startInfusion": {
          if (!patient) return;
          const volumeNum = parseFloat(patient.volume) || 0;
          const hoursNum = parseInt(patient.hours, 10) || 0;
          const minutesNum = parseInt(patient.minutes, 10) || 0;
          const totalMinutes = hoursToMinutes(hoursNum, minutesNum);
          if (volumeNum > 0 && totalMinutes > 0) {
            // Watch側が計算したendTimeがあればそれを優先し、通信遅延による再計算ズレを防ぐ
            const endTime = command.endTime
              ? new Date(command.endTime)
              : new Date(Date.now() + totalMinutes * 60 * 1000);
            await startPatient(command.patientId, endTime);
          }
          break;
        }
        case "stopInfusion": {
          await stopPatient(command.patientId);
          break;
        }
        case "requestSync": {
          await syncToWatch();
          break;
        }
      }
    };

    addMessageListener(handleWatchMessage);
    return () => {
      removeMessageListener(handleWatchMessage);
    };
  }, [startPatient, stopPatient, syncToWatch]);
};
