import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { NOTIFICATION_TIMING_OPTIONS } from '../constants/infusionSets';
import { colors, spacing, fontSize } from '../constants/theme';
import type { NotificationTimingOption } from '../types';

interface NotificationControlProps {
  isEnabled: boolean;
  selectedTiming: NotificationTimingOption;
  hasPermission: boolean;
  onToggle: (enabled: boolean, endTime?: Date) => Promise<void>;
  onTimingChange: (timing: NotificationTimingOption, endTime?: Date) => Promise<void>;
  endTime: Date | null;
  isValid: boolean;
}

// 通知制御コンポーネント
export const NotificationControl: React.FC<NotificationControlProps> = ({
  isEnabled,
  selectedTiming,
  hasPermission,
  onToggle,
  onTimingChange,
  endTime,
  isValid,
}) => {
  const handleToggle = (value: boolean) => {
    onToggle(value, endTime || undefined);
  };

  const handleTimingSelect = (timing: NotificationTimingOption) => {
    onTimingChange(timing, endTime || undefined);
  };

  if (!isValid) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 通知ON/OFF */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <Text style={styles.label}>終了通知</Text>
          {!hasPermission && (
            <Text style={styles.permissionWarning}>(通知権限が必要です)</Text>
          )}
        </View>
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={isEnabled ? colors.primary : colors.textSecondary}
        />
      </View>

      {/* タイミング選択 */}
      {isEnabled && (
        <View style={styles.timingContainer}>
          <Text style={styles.timingLabel}>通知タイミング</Text>
          <View style={styles.timingOptions}>
            {NOTIFICATION_TIMING_OPTIONS.map((option) => {
              const isSelected = selectedTiming.id === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.timingButton, isSelected && styles.timingButtonSelected]}
                  onPress={() => handleTimingSelect(option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timingButtonText,
                      isSelected && styles.timingButtonTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {isEnabled && (
            <Text style={styles.notificationInfo}>
              点滴終了の{selectedTiming.minutes}分前に通知します
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.medium,
    color: colors.text,
    fontWeight: '600',
  },
  permissionWarning: {
    fontSize: fontSize.small,
    color: colors.warning,
  },
  timingContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timingLabel: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  timingOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timingButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  timingButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timingButtonText: {
    fontSize: fontSize.medium,
    color: colors.text,
  },
  timingButtonTextSelected: {
    color: colors.textLight,
    fontWeight: '600',
  },
  notificationInfo: {
    marginTop: spacing.md,
    fontSize: fontSize.small,
    color: colors.secondary,
    textAlign: 'center',
  },
});
