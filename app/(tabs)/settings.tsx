import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useDisclaimer } from "../../src/contexts/DisclaimerContext";
import { colors, spacing, fontSize } from "../../src/constants/theme";

// 設定タブのトップ画面
export default function SettingsScreen() {
  const router = useRouter();
  const { resetAcceptance } = useDisclaimer();

  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || "1";

  // 免責事項の再表示
  const handleShowDisclaimer = () => {
    resetAcceptance();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>設定</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push("/settings/disclaimer")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="免責事項"
          >
            <Text style={styles.rowLabel}>免責事項</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push("/settings/privacy-policy")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="プライバシーポリシー"
          >
            <Text style={styles.rowLabel}>プライバシーポリシー</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rowLast}
            onPress={handleShowDisclaimer}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="免責事項を再表示"
          >
            <Text style={styles.rowLabel}>免責事項を再表示</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* バージョン情報 */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            バージョン {appVersion} ({buildNumber})
          </Text>
        </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowLabel: {
    fontSize: fontSize.medium,
    color: colors.text,
  },
  rowArrow: {
    fontSize: fontSize.large,
    color: colors.textSecondary,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  versionText: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
});
