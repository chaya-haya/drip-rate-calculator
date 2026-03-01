import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import * as Crypto from "expo-crypto";
import { savePresets, loadPresets } from "../lib/storage";
import { createPreset, updatePresetData } from "../features/presets/logic";
import type { Preset, PresetCreateData, PresetUpdateData } from "../types";
import type { PresetMutationResult, PresetsContextValue, SaveErrorInfo } from "../types/context";

const PresetsContext = createContext<PresetsContextValue | null>(null);

export const usePresets = (): PresetsContextValue => {
  const context = useContext(PresetsContext);
  if (!context) {
    throw new Error("usePresets must be used within a PresetsProvider");
  }
  return context;
};

interface PresetsProviderProps {
  children: ReactNode;
}

export const PresetsProvider: React.FC<PresetsProviderProps> = ({ children }) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<SaveErrorInfo | null>(null);
  const presetsRef = useRef<Preset[]>([]);

  const setPresetsState = useCallback((nextPresets: Preset[]) => {
    presetsRef.current = nextPresets;
    setPresets(nextPresets);
  }, []);

  const reloadPresets = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError(null);

    const result = await loadPresets();
    if (result.success) {
      setPresetsState(result.data);
    } else {
      setLoadError("プリセットの読み込みに失敗しました。");
    }

    setIsLoading(false);
  }, [setPresetsState]);

  const persistPresets = useCallback(async (nextPresets: Preset[]): Promise<boolean> => {
    setIsSaving(true);
    try {
      const result = await savePresets(nextPresets);
      if (result.success) {
        setSaveError(null);
        return true;
      }

      setSaveError({
        message: "プリセットの保存に失敗しました。",
        reason: result.error?.message || "ローカルストレージへの保存に失敗しました。",
        failedAt: new Date().toISOString(),
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const retrySavePresets = useCallback(async (): Promise<boolean> => {
    return persistPresets(presetsRef.current);
  }, [persistPresets]);

  // 初期読み込み
  useEffect(() => {
    reloadPresets();
  }, [reloadPresets]);

  // プリセットを追加
  const addPreset = useCallback(
    async (presetData: PresetCreateData): Promise<PresetMutationResult> => {
      const newPreset = createPreset(Crypto.randomUUID(), presetData, new Date().toISOString());

      const updatedPresets = [...presetsRef.current, newPreset];
      setPresetsState(updatedPresets);
      const saved = await persistPresets(updatedPresets);
      return { preset: newPreset, saved };
    },
    [persistPresets, setPresetsState]
  );

  // プリセットを更新
  const updatePreset = useCallback(
    async (id: string, updates: PresetUpdateData): Promise<boolean> => {
      const now = new Date().toISOString();
      const updatedPresets = presetsRef.current.map((preset) =>
        preset.id === id ? updatePresetData(preset, updates, now) : preset
      );
      setPresetsState(updatedPresets);
      return persistPresets(updatedPresets);
    },
    [persistPresets, setPresetsState]
  );

  // プリセットを削除
  const deletePreset = useCallback(
    async (id: string): Promise<boolean> => {
      const updatedPresets = presetsRef.current.filter((preset) => preset.id !== id);
      setPresetsState(updatedPresets);
      return persistPresets(updatedPresets);
    },
    [persistPresets, setPresetsState]
  );

  // IDでプリセットを取得
  const getPreset = useCallback(
    (id: string): Preset | undefined => {
      return presets.find((preset) => preset.id === id);
    },
    [presets]
  );

  const value: PresetsContextValue = {
    presets,
    isLoading,
    isSaving,
    loadError,
    saveError,
    addPreset,
    updatePreset,
    deletePreset,
    getPreset,
    reloadPresets,
    retrySavePresets,
  };

  return <PresetsContext.Provider value={value}>{children}</PresetsContext.Provider>;
};
