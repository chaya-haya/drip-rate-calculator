import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize } from "../../src/constants/theme";

interface TabIconProps {
  label: string;
  focused: boolean;
}

// シンプルなタブアイコン
const TabIcon: React.FC<TabIconProps> = ({ label, focused }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {label === "患者一覧" ? "👥" : "⭐"}
    </Text>
  </View>
);

// タブレイアウト
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "患者一覧",
          tabBarIcon: ({ focused }) => <TabIcon label="患者一覧" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="presets"
        options={{
          tabBarLabel: "プリセット",
          tabBarIcon: ({ focused }) => <TabIcon label="プリセット" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    paddingTop: 4,
  },
  tabBarLabel: {
    fontSize: fontSize.small,
    fontWeight: "600",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});
