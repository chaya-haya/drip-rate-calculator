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
          本アプリは点滴速度の計算を補助するツールです。{"\n\n"}
          【重要な注意事項】{"\n"}
          ・本アプリの計算結果はあくまで参考値です。{"\n"}
          ・実際の投薬・点滴管理は、必ず担当医師・看護師の指示に従ってください。{"\n"}
          ・本アプリの使用によって生じたいかなる損害についても、開発者は一切の責任を負いません。{"\n"}
          ・医療行為に関する最終判断は、必ず医療従事者が行ってください。{"\n\n"}
          本アプリは医療機器ではありません。診断・治療を目的とするものではありません。{"\n\n"}
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
