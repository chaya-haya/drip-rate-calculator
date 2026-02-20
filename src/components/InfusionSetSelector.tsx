import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { INFUSION_SET_LIST } from "../constants/infusionSets";
import { colors, spacing, fontSize } from "../constants/theme";
import type { InfusionSet } from "../types";

interface InfusionSetSelectorProps {
  selectedSet: InfusionSet;
  onSelectSet: (set: InfusionSet) => void;
  disabled?: boolean;
}

// 輸液セット選択コンポーネント
export const InfusionSetSelector: React.FC<InfusionSetSelectorProps> = ({
  selectedSet,
  onSelectSet,
  disabled = false,
}) => {
  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <Text style={styles.label}>輸液セット</Text>
      <View style={styles.buttonGroup}>
        {INFUSION_SET_LIST.map((set) => {
          const isSelected = selectedSet.id === set.id;
          return (
            <TouchableOpacity
              key={set.id}
              style={[styles.button, isSelected && styles.buttonSelected]}
              onPress={() => onSelectSet(set)}
              activeOpacity={0.7}
              disabled={disabled}
            >
              <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
                {set.name}
              </Text>
              <Text
                style={[styles.buttonDescription, isSelected && styles.buttonDescriptionSelected]}
              >
                {set.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
  },
  buttonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  buttonText: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.text,
  },
  buttonTextSelected: {
    color: colors.primaryDark,
  },
  buttonDescription: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  buttonDescriptionSelected: {
    color: colors.primaryDark,
  },
  disabled: {
    opacity: 0.6,
  },
});
