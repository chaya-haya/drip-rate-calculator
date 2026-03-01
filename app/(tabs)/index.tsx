import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePatients } from "../../src/contexts/PatientsContext";
import { PatientCard } from "../../src/components/PatientCard";
import { UnsavedBadge, UnsavedErrorNotice } from "../../src/components/UnsavedStatus";
import { colors, spacing, fontSize } from "../../src/constants/theme";
import type { PatientWithStatus, PatientStatusId } from "../../src/types";

// 患者一覧画面
export default function PatientListScreen() {
  const router = useRouter();
  const {
    patients,
    isLoading,
    isSaving,
    loadError,
    saveError,
    addPatient,
    reloadPatients,
    retrySavePatients,
  } = usePatients();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reloadPatients();
    setRefreshing(false);
  };

  const handleAddPatient = async () => {
    const result = await addPatient({});
    router.push(`/patient/${result.patient.id}`);
  };

  const handlePatientPress = (patient: PatientWithStatus) => {
    router.push(`/patient/${patient.id}`);
  };

  // ステータス順にソート（投与中 > 終了間近 > 待機中 > 完了）
  const sortedPatients = [...patients].sort((a, b) => {
    const order: Record<PatientStatusId, number> = {
      running: 0,
      ending_soon: 1,
      waiting: 2,
      completed: 3,
    };
    return (order[a.status.id] || 4) - (order[b.status.id] || 4);
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>点滴管理</Text>
          <UnsavedBadge visible={Boolean(saveError)} />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPatient}
          disabled={isSaving}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="患者を追加"
          accessibilityState={{ disabled: isSaving }}
        >
          <Text style={styles.addButtonText}>{isSaving ? "保存中..." : "+ 追加"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <UnsavedErrorNotice error={saveError} isSaving={isSaving} onRetry={retrySavePatients} />
        {isLoading ? (
          <Text style={styles.emptyText}>読み込み中...</Text>
        ) : loadError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.errorTitle}>{loadError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={reloadPatients}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="患者データを再読み込み"
            >
              <Text style={styles.retryButtonText}>再試行</Text>
            </TouchableOpacity>
          </View>
        ) : sortedPatients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💧</Text>
            <Text style={styles.emptyTitle}>患者が登録されていません</Text>
            <Text style={styles.emptyHint}>
              右上の「+ 追加」ボタンから患者を登録して{"\n"}
              点滴の滴下数を計算できます
            </Text>
          </View>
        ) : (
          sortedPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onPress={() => handlePatientPress(patient)}
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
    paddingVertical: spacing.xl * 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.large,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  errorTitle: {
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
