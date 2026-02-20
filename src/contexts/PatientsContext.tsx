import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Crypto from "expo-crypto";
import { savePatients, loadPatients } from "../lib/storage";
import { INFUSION_SETS } from "../constants/infusionSets";
import { calculatePatientStatus, calculateRemainingTime } from "../features/patients/logic";
import type { Patient, PatientWithStatus, PatientCreateData, PatientUpdateData } from "../types";
import type { PatientsContextValue } from "../types/context";
import { useWatchSync } from "../hooks/useWatchSync";

const PatientsContext = createContext<PatientsContextValue | null>(null);

export const usePatients = (): PatientsContextValue => {
  const context = useContext(PatientsContext);
  if (!context) {
    throw new Error("usePatients must be used within a PatientsProvider");
  }
  return context;
};

interface PatientsProviderProps {
  children: ReactNode;
}

export const PatientsProvider: React.FC<PatientsProviderProps> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ステータス再計算トリガー（値が変わるとpatientsWithStatusが再計算される）
  const [, setStatusTick] = useState(0);

  // フォアグラウンド復帰時にステータスを再計算
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        setStatusTick((t) => t + 1);
      }
    });
    return () => subscription.remove();
  }, []);

  // 30秒ごとにステータスを再計算（投与中タイマーの期限切れに対応）
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // 初期読み込み
  useEffect(() => {
    const load = async () => {
      const result = await loadPatients();
      if (result.success) {
        setPatients(result.data);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // 患者を追加
  const addPatient = useCallback(
    async (patientData: PatientCreateData): Promise<Patient> => {
      const newPatient: Patient = {
        id: Crypto.randomUUID(),
        roomNumber: patientData.roomNumber || "",
        bedNumber: patientData.bedNumber || "",
        infusionSet: patientData.infusionSet || INFUSION_SETS.ADULT,
        volume: patientData.volume || "",
        hours: patientData.hours || "",
        minutes: patientData.minutes || "",
        isRunning: false,
        startedAt: null,
        endTime: null,
        notificationEnabled: true,
        notificationTiming: { id: "10", label: "10分前", minutes: 10 },
        hapticEnabled: true,
        hapticIntensity: "medium",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPatients = [...patients, newPatient];
      setPatients(updatedPatients);
      await savePatients(updatedPatients);
      return newPatient;
    },
    [patients]
  );

  // 患者を更新
  const updatePatient = useCallback(
    async (id: string, updates: PatientUpdateData): Promise<void> => {
      const updatedPatients = patients.map((patient) =>
        patient.id === id
          ? { ...patient, ...updates, updatedAt: new Date().toISOString() }
          : patient
      );
      setPatients(updatedPatients);
      await savePatients(updatedPatients);
    },
    [patients]
  );

  // 患者を削除
  const deletePatient = useCallback(
    async (id: string): Promise<void> => {
      const updatedPatients = patients.filter((patient) => patient.id !== id);
      setPatients(updatedPatients);
      await savePatients(updatedPatients);
    },
    [patients]
  );

  // IDで患者を取得（ステータス付き）
  const getPatient = useCallback(
    (id: string): PatientWithStatus | undefined => {
      const patient = patients.find((p) => p.id === id);
      if (!patient) return undefined;
      return {
        ...patient,
        status: calculatePatientStatus(patient),
        remainingTime: calculateRemainingTime(patient),
      };
    },
    [patients]
  );

  // 点滴を開始
  const startPatient = useCallback(
    async (id: string, endTime: Date): Promise<void> => {
      await updatePatient(id, {
        isRunning: true,
        startedAt: new Date().toISOString(),
        endTime: endTime.toISOString(),
      });
    },
    [updatePatient]
  );

  // 点滴を停止
  const stopPatient = useCallback(
    async (id: string): Promise<void> => {
      await updatePatient(id, {
        isRunning: false,
        startedAt: null,
        endTime: null,
      });
    },
    [updatePatient]
  );

  // ステータス計算済み患者リスト
  const patientsWithStatus: PatientWithStatus[] = patients.map((patient) => ({
    ...patient,
    status: calculatePatientStatus(patient),
    remainingTime: calculateRemainingTime(patient),
  }));

  // Apple Watchへのデータ同期
  useWatchSync({ patients: patientsWithStatus, startPatient, stopPatient });

  const value: PatientsContextValue = {
    patients: patientsWithStatus,
    isLoading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    startPatient,
    stopPatient,
  };

  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>;
};
