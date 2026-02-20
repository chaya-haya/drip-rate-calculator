import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePresets } from "../../src/contexts/PresetsContext";
import { colors, spacing, fontSize } from "../../src/constants/theme";

// プリセット編集画面
export default function PresetEditScreen() {
  const { id: presetId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getPreset, updatePreset, deletePreset } = usePresets();
  const [name, setName] = useState("");

  const preset = getPreset(presetId!);

  useEffect(() => {
    if (preset) {
      setName(preset.name);
    }
  }, [preset]);

  const handleSave = async () => {
    if (name.trim()) {
      await updatePreset(presetId!, { name: name.trim() });
      router.back();
    }
  };

  const handleDelete = () => {
    Alert.alert("プリセットの削除", "このプリセットを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await deletePreset(presetId!);
          router.back();
        },
      },
    ]);
  };

  if (!preset) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>プリセットが見つかりません</Text>
      </SafeAreaView>
    );
  }

  const infusionSetName = preset.infusionSet?.name || "成人用";
  const timeText = `${preset.hours || 0}時間${preset.minutes || 0}分`;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>プリセット編集</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>保存</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>プリセット名</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="プリセット名を入力"
          placeholderTextColor={colors.border}
          maxLength={30}
        />

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>設定内容（変更不可）</Text>
          <Text style={styles.summaryText}>・輸液セット: {infusionSetName}</Text>
          <Text style={styles.summaryText}>・輸液量: {preset.volume || 0} mL</Text>
          <Text style={styles.summaryText}>・投与時間: {timeText}</Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
          <Text style={styles.deleteButtonText}>プリセットを削除</Text>
        </TouchableOpacity>
      </View>
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
  backText: {
    color: colors.primary,
    fontSize: fontSize.medium,
  },
  title: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.text,
  },
  saveText: {
    color: colors.primary,
    fontSize: fontSize.medium,
    fontWeight: "600",
  },
  content: {
    padding: spacing.md,
  },
  label: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSize.medium,
    marginBottom: spacing.lg,
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.xl,
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
  deleteButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: "center",
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: fontSize.medium,
  },
  errorText: {
    fontSize: fontSize.medium,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
