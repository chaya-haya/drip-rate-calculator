import React, { useCallback } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "../constants/theme";
import { INPUT_LIMITS } from "../constants/infusionSets";

interface InputFormProps {
  volume: string;
  onVolumeChange: (value: string) => void;
  hours: string;
  onHoursChange: (value: string) => void;
  minutes: string;
  onMinutesChange: (value: string) => void;
  disabled?: boolean;
}

// 輸液量・投与時間入力フォームコンポーネント
export const InputForm: React.FC<InputFormProps> = ({
  volume,
  onVolumeChange,
  hours,
  onHoursChange,
  minutes,
  onMinutesChange,
  disabled = false,
}) => {
  const handleHoursChange = useCallback(
    (value: string) => {
      const num = parseInt(value, 10);
      if (value === "" || (num >= 0 && num <= INPUT_LIMITS.MAX_HOURS)) {
        onHoursChange(value);
      }
    },
    [onHoursChange]
  );

  const handleMinutesChange = useCallback(
    (value: string) => {
      const num = parseInt(value, 10);
      if (value === "" || (num >= 0 && num <= INPUT_LIMITS.MAX_MINUTES)) {
        onMinutesChange(value);
      }
    },
    [onMinutesChange]
  );

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {/* 輸液量入力 */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>輸液量</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={volume}
            onChangeText={onVolumeChange}
            keyboardType="numeric"
            placeholder="500"
            placeholderTextColor={colors.border}
            maxLength={4}
            editable={!disabled}
          />
          <Text style={styles.unit}>mL</Text>
        </View>
      </View>

      {/* 投与時間入力 */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>投与時間</Text>
        <View style={styles.timeInputRow}>
          <View style={styles.timeInput}>
            <TextInput
              style={[styles.input, disabled && styles.inputDisabled]}
              value={hours}
              onChangeText={handleHoursChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.border}
              maxLength={2}
              editable={!disabled}
            />
            <Text style={styles.unit}>時間</Text>
          </View>
          <View style={styles.timeInput}>
            <TextInput
              style={[styles.input, disabled && styles.inputDisabled]}
              value={minutes}
              onChangeText={handleMinutesChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.border}
              maxLength={2}
              editable={!disabled}
            />
            <Text style={styles.unit}>分</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  timeInputRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timeInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSize.xlarge,
    backgroundColor: colors.surface,
    textAlign: "center",
    fontWeight: "bold",
  },
  unit: {
    fontSize: fontSize.large,
    color: colors.text,
    minWidth: 50,
  },
  inputDisabled: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },
  disabled: {
    opacity: 0.6,
  },
});
