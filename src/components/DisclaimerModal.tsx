import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useDisclaimer } from "../contexts/DisclaimerContext";
import { colors, spacing, fontSize } from "../constants/theme";

// 初回起動時に表示する医療免責事項ダイアログ（キャンセル不可）
export const DisclaimerModal: React.FC = () => {
  const { isAccepted, accept, isLoaded } = useDisclaimer();

  // 読み込み完了 & 未同意の場合のみ表示
  const visible = isLoaded && !isAccepted;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container} accessibilityViewIsModal={true}>
          <Text style={styles.title}>免責事項・ご利用にあたって</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator>
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

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={accept}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="同意してアプリを使用する"
          >
            <Text style={styles.acceptButtonText}>同意してアプリを使用する</Text>
          </TouchableOpacity>

          <Text style={styles.note}>※ 同意しない場合はアプリを終了してください</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    width: "100%",
    maxHeight: "80%",
  },
  title: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  scrollView: {
    maxHeight: 300,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: fontSize.medium,
    color: colors.text,
    lineHeight: 24,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  acceptButtonText: {
    color: colors.textLight,
    fontSize: fontSize.medium,
    fontWeight: "bold",
  },
  note: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
