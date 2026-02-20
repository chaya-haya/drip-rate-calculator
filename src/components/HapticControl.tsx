import React from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "../constants/theme";
import { HAPTIC_INTENSITY } from "../features/calculation/hooks/useDripAnimation";
import type { HapticIntensity } from "../types";

interface IntensityOption {
  id: HapticIntensity;
  label: string;
}

// ハプティック強度オプション
const INTENSITY_OPTIONS: IntensityOption[] = [
  { id: HAPTIC_INTENSITY.LIGHT, label: "弱" },
  { id: HAPTIC_INTENSITY.MEDIUM, label: "中" },
  { id: HAPTIC_INTENSITY.HEAVY, label: "強" },
];

interface HapticControlProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  intensity: HapticIntensity;
  onIntensityChange: (intensity: HapticIntensity) => void;
  isValid: boolean;
}

// 振動フィードバック制御コンポーネント
export const HapticControl: React.FC<HapticControlProps> = ({
  isEnabled,
  onToggle,
  intensity,
  onIntensityChange,
  isValid,
}) => {
  if (!isValid) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>振動フィードバック</Text>
          <Text style={styles.description}>滴下に合わせて振動でお知らせ</Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={isEnabled ? colors.primary : colors.textSecondary}
        />
      </View>

      {isEnabled && (
        <View style={styles.intensityContainer}>
          <Text style={styles.intensityLabel}>振動の強さ</Text>
          <View style={styles.intensityOptions}>
            {INTENSITY_OPTIONS.map((option) => {
              const isSelected = intensity === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.intensityButton, isSelected && styles.intensityButtonSelected]}
                  onPress={() => onIntensityChange(option.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.intensityButtonText,
                      isSelected && styles.intensityButtonTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.hint}>画面を見なくても滴下スピードを確認できます</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: fontSize.medium,
    color: colors.text,
    fontWeight: "600",
  },
  description: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  intensityContainer: {
    marginTop: spacing.md,
  },
  intensityLabel: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  intensityOptions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  intensityButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  intensityButtonText: {
    fontSize: fontSize.medium,
    color: colors.text,
    fontWeight: "600",
  },
  intensityButtonTextSelected: {
    color: colors.textLight,
  },
  hint: {
    marginTop: spacing.md,
    fontSize: fontSize.small,
    color: colors.secondary,
    textAlign: "center",
  },
});
