import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "../constants/theme";
import type { SaveErrorInfo } from "../types/context";

interface UnsavedBadgeProps {
  visible: boolean;
}

interface UnsavedErrorNoticeProps {
  error: SaveErrorInfo | null;
  isSaving?: boolean;
  onRetry: () => void | Promise<void>;
  retryLabel?: string;
}

export const UnsavedBadge: React.FC<UnsavedBadgeProps> = ({ visible }) => {
  if (!visible) return null;

  return <Text style={styles.badge}>未保存</Text>;
};

export const UnsavedErrorNotice: React.FC<UnsavedErrorNoticeProps> = ({
  error,
  isSaving = false,
  onRetry,
  retryLabel = "保存を再試行",
}) => {
  if (!error) return null;

  const failedAt = new Date(error.failedAt).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{error.message}</Text>
      <Text style={styles.meta}>前回失敗: {failedAt}</Text>
      <Text style={styles.meta}>原因: {error.reason}</Text>
      <TouchableOpacity
        style={[styles.button, isSaving && styles.buttonDisabled]}
        onPress={onRetry}
        disabled={isSaving}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={retryLabel}
        accessibilityState={{ disabled: isSaving }}
      >
        <Text style={styles.buttonText}>{isSaving ? "保存中..." : retryLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    fontSize: fontSize.small,
    color: colors.error,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: "hidden",
  },
  container: {
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  message: {
    fontSize: fontSize.small,
    color: colors.error,
    textAlign: "center",
  },
  meta: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    fontSize: fontSize.small,
    color: colors.error,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
