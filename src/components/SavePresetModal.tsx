import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, spacing, fontSize } from "../constants/theme";
import type { InfusionSet, PresetCreateData } from "../types";

interface CurrentSettings {
  infusionSet: InfusionSet;
  volume: string;
  hours: string;
  minutes: string;
}

interface SavePresetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (presetData: PresetCreateData) => Promise<boolean>;
  isSaving?: boolean;
  currentSettings: CurrentSettings;
}

// プリセット保存モーダル
export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  visible,
  onClose,
  onSave,
  isSaving = false,
  currentSettings,
}) => {
  const [name, setName] = useState("");

  const handleSave = async () => {
    if (name.trim()) {
      const saved = await onSave({
        name: name.trim(),
        ...currentSettings,
      });
      if (saved) {
        setName("");
        onClose();
      }
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  const infusionSetName = currentSettings?.infusionSet?.name || "成人用";
  const timeText = `${currentSettings?.hours || 0}時間${currentSettings?.minutes || 0}分`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.container} accessibilityViewIsModal={true}>
          <View style={styles.header}>
            <Text style={styles.title}>プリセットを保存</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="閉じる"
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>名前を入力してください</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="例: ソルデム3A 標準"
            placeholderTextColor={colors.border}
            autoFocus
            maxLength={30}
            accessibilityLabel="プリセット名"
          />

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>保存内容:</Text>
            <Text style={styles.summaryText}>・輸液セット: {infusionSetName}</Text>
            <Text style={styles.summaryText}>・輸液量: {currentSettings?.volume || 0} mL</Text>
            <Text style={styles.summaryText}>・投与時間: {timeText}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="キャンセル"
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, (!name.trim() || isSaving) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!name.trim() || isSaving}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="保存"
              accessibilityState={{ disabled: !name.trim() || isSaving }}
            >
              <Text style={styles.saveButtonText}>{isSaving ? "保存中..." : "保存"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  label: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSize.medium,
    marginBottom: spacing.lg,
  },
  summary: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: fontSize.small,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.medium,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    color: colors.textLight,
    fontSize: fontSize.medium,
    fontWeight: "600",
  },
});
