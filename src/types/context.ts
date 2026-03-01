import type { Patient, PatientWithStatus, PatientCreateData, PatientUpdateData } from "./patient";
import type { Preset, PresetCreateData, PresetUpdateData } from "./preset";

export interface PatientMutationResult {
  patient: Patient;
  saved: boolean;
}

export interface PresetMutationResult {
  preset: Preset;
  saved: boolean;
}

export interface SaveErrorInfo {
  message: string;
  reason: string;
  failedAt: string;
}

// PatientsContext の値型
export interface PatientsContextValue {
  patients: PatientWithStatus[];
  isLoading: boolean;
  loadError: string | null;
  isSaving: boolean;
  saveError: SaveErrorInfo | null;
  addPatient: (data: PatientCreateData) => Promise<PatientMutationResult>;
  updatePatient: (id: string, updates: PatientUpdateData) => Promise<boolean>;
  deletePatient: (id: string) => Promise<boolean>;
  getPatient: (id: string) => PatientWithStatus | undefined;
  startPatient: (id: string, endTime: Date) => Promise<boolean>;
  stopPatient: (id: string) => Promise<boolean>;
  reloadPatients: () => Promise<void>;
  retrySavePatients: () => Promise<boolean>;
}

// PresetsContext の値型
export interface PresetsContextValue {
  presets: Preset[];
  isLoading: boolean;
  loadError: string | null;
  isSaving: boolean;
  saveError: SaveErrorInfo | null;
  addPreset: (data: PresetCreateData) => Promise<PresetMutationResult>;
  updatePreset: (id: string, updates: PresetUpdateData) => Promise<boolean>;
  deletePreset: (id: string) => Promise<boolean>;
  getPreset: (id: string) => Preset | undefined;
  reloadPresets: () => Promise<void>;
  retrySavePresets: () => Promise<boolean>;
}

// NotificationContext の値型
export interface NotificationContextValue {
  hasPermission: boolean;
  ensurePermission: () => Promise<boolean>;
  scheduleForPatient: (
    patientId: string,
    endTime: Date,
    timingMinutes: number,
    options?: { requestPermission?: boolean }
  ) => Promise<string | null>;
  cancelForPatient: (patientId: string) => Promise<void>;
  cancelAll: () => Promise<void>;
  isScheduledForPatient: (patientId: string) => boolean;
}
