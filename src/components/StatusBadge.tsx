import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { fontSize, spacing } from "../constants/theme";
import type { PatientStatusConfig } from "../types";

interface StatusBadgeProps {
  status: PatientStatusConfig;
}

// ステータスバッジコンポーネント
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <View
      style={[styles.badge, { backgroundColor: status.color }]}
      accessibilityRole="text"
      accessibilityLabel={`ステータス: ${status.label}`}
    >
      <Text style={styles.text}>{status.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  text: {
    color: "#FFFFFF",
    fontSize: fontSize.small,
    fontWeight: "600",
  },
});
