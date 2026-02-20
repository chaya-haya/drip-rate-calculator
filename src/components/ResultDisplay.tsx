import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "../constants/theme";
import { formatTime } from "../features/calculation/logic";

interface ResultDisplayProps {
  dropsPerMinute: number;
  totalDrops: number;
  totalMinutes: number;
  endTime: Date | null;
  isValid: boolean;
}

// 計算結果表示コンポーネント
export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  dropsPerMinute,
  totalDrops,
  totalMinutes,
  endTime,
  isValid,
}) => {
  if (!isValid) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>輸液量と投与時間を入力してください</Text>
        </View>
      </View>
    );
  }

  const roundedDrops = Math.round(dropsPerMinute * 10) / 10;

  return (
    <View style={styles.container}>
      {/* メイン結果: 滴/分 */}
      <View style={styles.mainResult}>
        <Text style={styles.mainValue}>{roundedDrops}</Text>
        <Text style={styles.mainUnit}>滴/分</Text>
      </View>

      {/* サブ情報 */}
      <View style={styles.subResults}>
        <View style={styles.subResultItem}>
          <Text style={styles.subLabel}>総滴下数</Text>
          <Text style={styles.subValue}>{totalDrops.toLocaleString()} 滴</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.subResultItem}>
          <Text style={styles.subLabel}>投与時間</Text>
          <Text style={styles.subValue}>
            {Math.floor(totalMinutes / 60)}時間{totalMinutes % 60}分
          </Text>
        </View>

        {endTime && (
          <>
            <View style={styles.divider} />
            <View style={styles.subResultItem}>
              <Text style={styles.subLabel}>終了予定</Text>
              <Text style={styles.subValue}>{formatTime(endTime)}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  placeholder: {
    padding: spacing.xl,
  },
  placeholderText: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  mainResult: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  mainValue: {
    fontSize: 64,
    fontWeight: "bold",
    color: colors.primary,
  },
  mainUnit: {
    fontSize: fontSize.xlarge,
    color: colors.primaryDark,
    marginLeft: spacing.sm,
  },
  subResults: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    flexWrap: "wrap",
  },
  subResultItem: {
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  subLabel: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  subValue: {
    fontSize: fontSize.medium,
    fontWeight: "600",
    color: colors.text,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
});
