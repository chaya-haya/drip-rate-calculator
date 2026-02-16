import type {
  Patient,
  PatientWithStatus,
  PatientCreateData,
  PatientUpdateData,
} from "./patient";
import type { Preset, PresetCreateData, PresetUpdateData } from "./preset";

// PatientsContext の値型
export interface PatientsContextValue {
  patients: PatientWithStatus[];
  isLoading: boolean;
  addPatient: (data: PatientCreateData) => Promise<Patient>;
  updatePatient: (id: string, updates: PatientUpdateData) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  getPatient: (id: string) => PatientWithStatus | undefined;
  startPatient: (id: string, endTime: Date) => Promise<void>;
  stopPatient: (id: string) => Promise<void>;
}

// PresetsContext の値型
export interface PresetsContextValue {
  presets: Preset[];
  isLoading: boolean;
  addPreset: (data: PresetCreateData) => Promise<Preset>;
  updatePreset: (id: string, updates: PresetUpdateData) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  getPreset: (id: string) => Preset | undefined;
}

// NotificationContext の値型
export interface NotificationContextValue {
  hasPermission: boolean;
  scheduleForPatient: (
    patientId: string,
    patientName: string,
    endTime: Date,
    timingMinutes: number
  ) => Promise<string | null>;
  cancelForPatient: (patientId: string) => Promise<void>;
  cancelAll: () => Promise<void>;
  isScheduledForPatient: (patientId: string) => boolean;
}
