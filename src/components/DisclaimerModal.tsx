import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
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
        <View style={styles.container}>
          <Text style={styles.title}>免責事項・ご利用にあたって</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator>
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

          <TouchableOpacity style={styles.acceptButton} onPress={accept} activeOpacity={0.8}>
            <Text style={styles.acceptButtonText}>同意してアプリを使用する</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            ※ 同意しない場合はアプリを終了してください
          </Text>
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
