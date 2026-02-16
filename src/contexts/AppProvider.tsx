import React, { ReactNode } from "react";
import { PatientsProvider } from "./PatientsContext";
import { PresetsProvider } from "./PresetsContext";
import { NotificationProvider } from "./NotificationContext";

interface AppProviderProps {
  children: ReactNode;
}

// 全Contextを束ねるProvider
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <NotificationProvider>
      <PatientsProvider>
        <PresetsProvider>{children}</PresetsProvider>
      </PatientsProvider>
    </NotificationProvider>
  );
};
