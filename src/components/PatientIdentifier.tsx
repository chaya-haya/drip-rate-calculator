import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../constants/theme';

interface PatientIdentifierProps {
  roomNumber: string;
  onRoomNumberChange: (value: string) => void;
  bedNumber: string;
  onBedNumberChange: (value: string) => void;
  disabled?: boolean;
}

// 患者識別入力コンポーネント（号室・ベッド番号）
export const PatientIdentifier: React.FC<PatientIdentifierProps> = ({
  roomNumber,
  onRoomNumberChange,
  bedNumber,
  onBedNumberChange,
  disabled = false,
}) => {
  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <Text style={styles.label}>患者識別</Text>
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>号室番号</Text>
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={roomNumber}
            onChangeText={onRoomNumberChange}
            placeholder="101"
            placeholderTextColor={colors.border}
            keyboardType="number-pad"
            maxLength={3}
            editable={!disabled}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ベッド番号</Text>
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={bedNumber}
            onChangeText={onBedNumberChange}
            placeholder="1"
            placeholderTextColor={colors.border}
            keyboardType="number-pad"
            maxLength={1}
            editable={!disabled}
          />
        </View>
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: fontSize.medium,
    backgroundColor: colors.surface,
  },
  inputDisabled: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },
  disabled: {
    opacity: 0.6,
  },
});
