import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePresets } from "../../src/contexts/PresetsContext";
import { PresetCard } from "../../src/components/PresetCard";
import { UnsavedBadge, UnsavedErrorNotice } from "../../src/components/UnsavedStatus";
import { colors, spacing, fontSize } from "../../src/constants/theme";
import type { Preset } from "../../src/types";

// プリセット一覧画面
export default function PresetListScreen() {
  const router = useRouter();
  const {
    presets,
    isLoading,
    isSaving,
    loadError,
    saveError,
    deletePreset,
    reloadPresets,
    retrySavePresets,
  } = usePresets();

  const handleSelect = (_preset: Preset) => {
    // タブからの選択は無効（選択モードはモーダルからのみ）
  };

  const handleEdit = (preset: Preset) => {
    router.push(`/preset/${preset.id}`);
  };

  const handleDelete = (id: string) => {
    Alert.alert("プリセットの削除", "このプリセットを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => deletePreset(id),
      },
    ]);
  };

  const handleAdd = () => {
    router.push("/preset/create");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>プリセット</Text>
          <UnsavedBadge visible={Boolean(saveError)} />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="プリセットを追加"
          accessibilityState={{ disabled: isSaving }}
        >
          <Text style={styles.addButtonText}>{isSaving ? "保存中..." : "+ 追加"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <UnsavedErrorNotice error={saveError} isSaving={isSaving} onRetry={retrySavePresets} />
        {isLoading ? (
          <Text style={styles.emptyText}>読み込み中...</Text>
        ) : loadError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.errorText}>{loadError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={reloadPresets}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="プリセットを再読み込み"
            >
              <Text style={styles.retryButtonText}>再試行</Text>
            </TouchableOpacity>
          </View>
        ) : presets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>プリセットがありません</Text>
            <Text style={styles.emptyHint}>「+ 追加」ボタンでプリセットを作成できます</Text>
          </View>
        ) : (
          presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>
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
  title: {
    fontSize: fontSize.xlarge,
    fontWeight: "bold",
    color: colors.text,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.textLight,
    fontSize: fontSize.medium,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyHint: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  errorText: {
    fontSize: fontSize.medium,
    color: colors.warning,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.textLight,
    fontSize: fontSize.medium,
    fontWeight: "600",
  },
});
