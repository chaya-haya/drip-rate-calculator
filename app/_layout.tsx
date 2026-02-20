import { Stack } from "expo-router";
import { AppProvider } from "../src/contexts/AppProvider";

// ルートレイアウト: 全Contextを束ね、Stack構成を定義
export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="patient/[id]" options={{ presentation: "card" }} />
        <Stack.Screen name="preset/create" options={{ presentation: "modal" }} />
        <Stack.Screen name="preset/[id]" options={{ presentation: "modal" }} />
      </Stack>
    </AppProvider>
  );
}
