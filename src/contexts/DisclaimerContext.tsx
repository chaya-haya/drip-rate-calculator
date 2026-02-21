import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";

interface DisclaimerContextValue {
  // 免責事項への同意が完了しているか
  isAccepted: boolean;
  // 同意ボタン押下時に呼ぶ
  accept: () => Promise<void>;
  // AsyncStorage の読み込みが完了したか
  isLoaded: boolean;
}

const DisclaimerContext = createContext<DisclaimerContextValue | undefined>(undefined);

interface DisclaimerProviderProps {
  children: ReactNode;
}

// 免責事項の同意状態を管理するProvider
export const DisclaimerProvider: React.FC<DisclaimerProviderProps> = ({ children }) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 起動時に同意済みフラグを読み込む
  useEffect(() => {
    const load = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.DISCLAIMER_ACCEPTED);
        setIsAccepted(value === "true");
      } catch {
        // 読み込み失敗時は未同意扱い（安全側に倒す）
        setIsAccepted(false);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  // 同意を記録する
  const accept = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.DISCLAIMER_ACCEPTED, "true");
    setIsAccepted(true);
  };

  return (
    <DisclaimerContext.Provider value={{ isAccepted, accept, isLoaded }}>
      {children}
    </DisclaimerContext.Provider>
  );
};

export const useDisclaimer = (): DisclaimerContextValue => {
  const context = useContext(DisclaimerContext);
  if (!context) {
    throw new Error("useDisclaimer must be used within DisclaimerProvider");
  }
  return context;
};
