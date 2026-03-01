import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, fontSize } from "../../src/constants/theme";

// プライバシーポリシー詳細ページ（設定タブから遷移）
export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>プライバシーポリシー</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>最終更新日: 2026年2月22日</Text>

        <Text style={styles.sectionTitle}>1. はじめに</Text>
        <Text style={styles.body}>
          本プライバシーポリシーは、点滴速度計算アプリ（以下「本アプリ」）における個人情報およびデータの取り扱いについて説明します。
        </Text>

        <Text style={styles.sectionTitle}>2. 収集する情報</Text>
        <Text style={styles.body}>
          本アプリでは、以下の情報をお使いのデバイス内にのみ保存します。{"\n\n"}
          ・病室番号・ベッド番号{"\n"}
          ・投薬設定（薬剤名、投与量、投与速度等）{"\n"}
          ・プリセット設定{"\n"}
          ・アプリの設定情報
        </Text>

        <Text style={styles.sectionTitle}>3. データの保存と管理</Text>
        <Text style={styles.body}>
          本アプリのすべてのデータはお使いのデバイス内にのみ保存されます。外部サーバーへのデータ送信は一切行いません。
          {"\n\n"}
          お客様のデータが第三者に共有・販売されることはありません。
        </Text>

        <Text style={styles.sectionTitle}>4. Apple Watchとのデータ同期</Text>
        <Text style={styles.body}>
          本アプリはApple
          Watchとの間でデータを同期する機能を提供します。この同期はAppleのWatchConnectivityフレームワークを使用し、お使いのiPhoneとApple
          Watch間でのみ直接行われます。{"\n\n"}
          同期データがインターネットを経由して外部に送信されることはありません。
        </Text>

        <Text style={styles.sectionTitle}>5. データの削除</Text>
        <Text style={styles.body}>
          本アプリを削除すると、デバイスに保存されたすべてのデータが完全に削除されます。{"\n\n"}
          Apple Watchアプリを削除した場合も、Watch側のデータはすべて削除されます。
        </Text>

        <Text style={styles.sectionTitle}>6. 分析・トラッキング</Text>
        <Text style={styles.body}>
          本アプリは分析ツールやトラッキングSDKを一切使用していません。お客様の利用状況を収集・分析することはありません。
        </Text>

        <Text style={styles.sectionTitle}>7. お問い合わせ</Text>
        <Text style={styles.body}>
          本プライバシーポリシーに関するご質問やお問い合わせは、App
          Storeのアプリページからお願いいたします。
        </Text>

        <Text style={styles.sectionTitle}>8. ポリシーの変更</Text>
        <Text style={styles.body}>
          本プライバシーポリシーは、必要に応じて更新されることがあります。変更があった場合は、アプリ内で通知いたします。
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
    paddingBottom: spacing.xl,
  },
  lastUpdated: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.medium,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.medium,
    color: colors.text,
    lineHeight: 26,
  },
});
