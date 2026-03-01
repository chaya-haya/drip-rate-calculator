import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, fontSize } from "../../src/constants/theme";

// 免責事項詳細ページ（設定タブから遷移）
export default function DisclaimerPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>免責事項</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.body}>
          本アプリは、点滴管理に関する計算の参考情報を提供する補助ツールです。{"\n\n"}
          【重要な注意事項】{"\n"}
          ・本アプリの計算結果は参考情報であり、正確性や完全性を保証するものではありません。{"\n"}
          ・本アプリは医療機器ではなく、診断、治療、投与判断その他の医療判断を目的とするものではありません。{"\n"}
          ・本アプリの表示内容のみに基づいて診療上の判断を行わないでください。{"\n"}
          ・実際の投与、滴下管理、患者管理にあたっては、必ず医師の指示、院内手順、実際の滴下状況を確認してください。{"\n"}
          ・医療行為に関する最終判断は、必ず医療従事者が行ってください。{"\n\n"}
          上記の内容を理解・同意した上でご利用ください。
        </Text>
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
  backText: {
    color: colors.primary,
    fontSize: fontSize.medium,
  },
  title: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  body: {
    fontSize: fontSize.medium,
    color: colors.text,
    lineHeight: 26,
  },
});
