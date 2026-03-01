import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePresets } from "../../src/contexts/PresetsContext";
import { InfusionSetSelector } from "../../src/components/InfusionSetSelector";
import { InputForm } from "../../src/components/InputForm";
import { UnsavedBadge, UnsavedErrorNotice } from "../../src/components/UnsavedStatus";
import { INFUSION_SETS } from "../../src/constants/infusionSets";
import { colors, spacing, fontSize } from "../../src/constants/theme";
import type { InfusionSet } from "../../src/types";

// プリセット新規作成画面
export default function PresetCreateScreen() {
  const router = useRouter();
  const { addPreset, isSaving, saveError, retrySavePresets } = usePresets();

  const [name, setName] = useState("");
  const [infusionSet, setInfusionSet] = useState<InfusionSet>(INFUSION_SETS.ADULT);
  const [volume, setVolume] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const isValid = name.trim() && volume && (hours || minutes);

  const handleSave = async () => {
    if (!isValid) return;

    const result = await addPreset({
      name: name.trim(),
      infusionSet,
      volume,
      hours,
      minutes,
    });
    if (result.saved) {
      router.back();
    }
  };

  const handleCancel = () => {
    if (!saveError || isSaving) {
      router.back();
      return;
    }

    Alert.alert(
      "未保存の変更があります",
      "保存に失敗した変更があります。このまま戻ると、端末再起動後に失われる可能性があります。",
      [
        {
          text: "そのまま戻る",
          style: "destructive",
          onPress: () => router.back(),
        },
        { text: "キャンセル", style: "cancel" },
        {
          text: "保存を再試行",
          onPress: async () => {
            await retrySavePresets();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="キャンセル"
        >
          <Text style={styles.cancelText}>キャンセル</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title}>新規プリセット</Text>
          <UnsavedBadge visible={Boolean(saveError)} />
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isValid || isSaving}
          accessibilityRole="button"
          accessibilityLabel="保存"
          accessibilityState={{ disabled: !isValid || isSaving }}
        >
          <Text style={[styles.saveText, (!isValid || isSaving) && styles.saveTextDisabled]}>
            {isSaving ? "保存中..." : "保存"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <UnsavedErrorNotice error={saveError} isSaving={isSaving} onRetry={retrySavePresets} />
          <Text style={styles.label}>プリセット名</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="プリセット名を入力"
            placeholderTextColor={colors.border}
            maxLength={30}
            accessibilityLabel="プリセット名"
          />

          <InfusionSetSelector selectedSet={infusionSet} onSelectSet={setInfusionSet} />

          <InputForm
            volume={volume}
            onVolumeChange={setVolume}
            hours={hours}
            onHoursChange={setHours}
            minutes={minutes}
            onMinutesChange={setMinutes}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelText: {
    color: colors.primary,
    fontSize: fontSize.medium,
  },
  title: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.text,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  saveText: {
    color: colors.primary,
    fontSize: fontSize.medium,
    fontWeight: "600",
  },
  saveTextDisabled: {
    color: colors.border,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  label: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSize.medium,
  },
});
