import { PATIENT_STATUS } from "../../constants/infusionSets";
import type { PatientStatusConfig } from "../../types/infusion";
import type { Patient } from "../../types/patient";

// 患者のステータスを判定
export const calculatePatientStatus = (patient: Patient): PatientStatusConfig => {
  if (!patient.isRunning || !patient.endTime) {
    return PATIENT_STATUS.WAITING;
  }

  const now = new Date();
  const endTime = new Date(patient.endTime);
  const remainingMs = endTime.getTime() - now.getTime();

  if (remainingMs <= 0) {
    return PATIENT_STATUS.COMPLETED;
  }

  // 残り5分以内
  if (remainingMs <= 5 * 60 * 1000) {
    return PATIENT_STATUS.ENDING_SOON;
  }

  return PATIENT_STATUS.RUNNING;
};

// 残り時間を計算（ミリ秒、未実行時はnull）
export const calculateRemainingTime = (patient: Patient): number | null => {
  if (!patient.isRunning || !patient.endTime) {
    return null;
  }

  const now = new Date();
  const endTime = new Date(patient.endTime);
  const remainingMs = endTime.getTime() - now.getTime();

  return Math.max(0, remainingMs);
};
