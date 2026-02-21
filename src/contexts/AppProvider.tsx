import React, { ReactNode } from "react";
import { PatientsProvider } from "./PatientsContext";
import { PresetsProvider } from "./PresetsContext";
import { NotificationProvider } from "./NotificationContext";
import { DisclaimerProvider } from "./DisclaimerContext";

interface AppProviderProps {
  children: ReactNode;
}

// 全Contextを束ねるProvider
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <DisclaimerProvider>
      <NotificationProvider>
        <PatientsProvider>
          <PresetsProvider>{children}</PresetsProvider>
        </PatientsProvider>
      </NotificationProvider>
    </DisclaimerProvider>
  );
};
