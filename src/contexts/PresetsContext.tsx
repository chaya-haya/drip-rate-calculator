import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import * as Crypto from "expo-crypto";
import { savePresets, loadPresets } from "../lib/storage";
import { createPreset, updatePresetData } from "../features/presets/logic";
import type { Preset, PresetCreateData, PresetUpdateData } from "../types";
import type { PresetsContextValue } from "../types/context";

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

  // 初期読み込み
  useEffect(() => {
    const load = async () => {
      const result = await loadPresets();
      if (result.success) {
        setPresets(result.data);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // プリセットを追加
  const addPreset = useCallback(
    async (presetData: PresetCreateData): Promise<Preset> => {
      const newPreset = createPreset(
        Crypto.randomUUID(),
        presetData,
        new Date().toISOString()
      );

      const updatedPresets = [...presets, newPreset];
      setPresets(updatedPresets);
      await savePresets(updatedPresets);
      return newPreset;
    },
    [presets]
  );

  // プリセットを更新
  const updatePreset = useCallback(
    async (id: string, updates: PresetUpdateData): Promise<void> => {
      const now = new Date().toISOString();
      const updatedPresets = presets.map((preset) =>
        preset.id === id ? updatePresetData(preset, updates, now) : preset
      );
      setPresets(updatedPresets);
      await savePresets(updatedPresets);
    },
    [presets]
  );

  // プリセットを削除
  const deletePreset = useCallback(
    async (id: string): Promise<void> => {
      const updatedPresets = presets.filter((preset) => preset.id !== id);
      setPresets(updatedPresets);
      await savePresets(updatedPresets);
    },
    [presets]
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
    addPreset,
    updatePreset,
    deletePreset,
    getPreset,
  };

  return <PresetsContext.Provider value={value}>{children}</PresetsContext.Provider>;
};
