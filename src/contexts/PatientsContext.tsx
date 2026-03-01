import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Crypto from "expo-crypto";
import { savePatients, loadPatients } from "../lib/storage";
import { INFUSION_SETS } from "../constants/infusionSets";
import { calculatePatientStatus, calculateRemainingTime } from "../features/patients/logic";
import type { Patient, PatientWithStatus, PatientCreateData, PatientUpdateData } from "../types";
import type { PatientMutationResult, PatientsContextValue, SaveErrorInfo } from "../types/context";
import { useWatchSync } from "../hooks/useWatchSync";
import { useNotifications } from "./NotificationContext";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<SaveErrorInfo | null>(null);
  // ステータス再計算トリガー（値が変わるとpatientsWithStatusが再計算される）
  const [, setStatusTick] = useState(0);
  const patientsRef = useRef<Patient[]>([]);
  const { scheduleForPatient, cancelForPatient } = useNotifications();

  const setPatientsState = useCallback((nextPatients: Patient[]) => {
    patientsRef.current = nextPatients;
    setPatients(nextPatients);
  }, []);

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

  const reloadPatients = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError(null);

    const result = await loadPatients();
    if (result.success) {
      setPatientsState(result.data);
    } else {
      setLoadError("患者データの読み込みに失敗しました。");
    }

    setIsLoading(false);
  }, [setPatientsState]);

  const persistPatients = useCallback(async (nextPatients: Patient[]): Promise<boolean> => {
    setIsSaving(true);
    try {
      const result = await savePatients(nextPatients);
      if (result.success) {
        setSaveError(null);
        return true;
      }

      setSaveError({
        message: "患者データの保存に失敗しました。",
        reason: result.error?.message || "ローカルストレージへの保存に失敗しました。",
        failedAt: new Date().toISOString(),
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const retrySavePatients = useCallback(async (): Promise<boolean> => {
    return persistPatients(patientsRef.current);
  }, [persistPatients]);

  // 初期読み込み
  useEffect(() => {
    reloadPatients();
  }, [reloadPatients]);

  // 患者を追加
  const addPatient = useCallback(
    async (patientData: PatientCreateData): Promise<PatientMutationResult> => {
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

      const updatedPatients = [...patientsRef.current, newPatient];
      setPatientsState(updatedPatients);
      const saved = await persistPatients(updatedPatients);
      return { patient: newPatient, saved };
    },
    [persistPatients, setPatientsState]
  );

  // 患者を更新
  const updatePatient = useCallback(
    async (id: string, updates: PatientUpdateData): Promise<boolean> => {
      const updatedPatients = patientsRef.current.map((patient) =>
        patient.id === id
          ? { ...patient, ...updates, updatedAt: new Date().toISOString() }
          : patient
      );
      setPatientsState(updatedPatients);
      return persistPatients(updatedPatients);
    },
    [persistPatients, setPatientsState]
  );

  // 患者を削除
  const deletePatient = useCallback(
    async (id: string): Promise<boolean> => {
      const updatedPatients = patientsRef.current.filter((patient) => patient.id !== id);
      setPatientsState(updatedPatients);
      return persistPatients(updatedPatients);
    },
    [persistPatients, setPatientsState]
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
    async (id: string, endTime: Date): Promise<boolean> => {
      const saved = await updatePatient(id, {
        isRunning: true,
        startedAt: new Date().toISOString(),
        endTime: endTime.toISOString(),
      });

      const patient = patientsRef.current.find((p) => p.id === id);
      if (patient?.notificationEnabled) {
        await scheduleForPatient(id, endTime, patient.notificationTiming.minutes);
      }
      return saved;
    },
    [updatePatient, scheduleForPatient]
  );

  // 点滴を停止
  const stopPatient = useCallback(
    async (id: string): Promise<boolean> => {
      const saved = await updatePatient(id, {
        isRunning: false,
        startedAt: null,
        endTime: null,
      });

      await cancelForPatient(id);
      return saved;
    },
    [updatePatient, cancelForPatient]
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
    isSaving,
    loadError,
    saveError,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    startPatient,
    stopPatient,
    reloadPatients,
    retrySavePatients,
  };

  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>;
};
