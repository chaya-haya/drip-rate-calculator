import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePatients } from "../../src/contexts/PatientsContext";
import { PatientCard } from "../../src/components/PatientCard";
import { colors, spacing, fontSize } from "../../src/constants/theme";
import type { PatientWithStatus, PatientStatusId } from "../../src/types";

// 患者一覧画面
export default function PatientListScreen() {
  const router = useRouter();
  const { patients, isLoading, addPatient } = usePatients();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const handleAddPatient = async () => {
    const newPatient = await addPatient({});
    router.push(`/patient/${newPatient.id}`);
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
        <Text style={styles.title}>点滴管理</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPatient} activeOpacity={0.7}>
          <Text style={styles.addButtonText}>+ 追加</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {isLoading ? (
          <Text style={styles.emptyText}>読み込み中...</Text>
        ) : sortedPatients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>患者が登録されていません</Text>
            <Text style={styles.emptyHint}>「+ 追加」ボタンで患者を追加してください</Text>
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
  },
});
