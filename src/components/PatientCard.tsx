import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { StatusBadge } from "./StatusBadge";
import { colors, spacing, fontSize } from "../constants/theme";
import { formatTime } from "../features/calculation/logic";
import type { PatientWithStatus } from "../types";

// 残り時間をフォーマット
const formatRemainingTime = (remainingMs: number | null): string | null => {
  if (!remainingMs || remainingMs <= 0) return null;

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

interface PatientCardProps {
  patient: PatientWithStatus;
  onPress: () => void;
}

// 患者カードコンポーネント
export const PatientCard: React.FC<PatientCardProps> = ({ patient, onPress }) => {
  const [localRemainingTime, setLocalRemainingTime] = useState<number | null>(
    patient.remainingTime
  );

  // 投与中の患者のリアルタイムカウントダウン
  useEffect(() => {
    if (!patient.isRunning || !patient.endTime) {
      setLocalRemainingTime(null);
      return;
    }

    const endTime = new Date(patient.endTime!);

    // 自己調整タイマー: 毎ティックごとに現在時刻から次の秒境界を再計算して予約する
    // → setInterval の誤差蓄積を防ぎ、Watch の Text(timerInterval:countsDown:true) と同期する
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      const remaining = Math.max(0, endTime.getTime() - Date.now());
      setLocalRemainingTime(remaining);

      if (remaining <= 0) return;

      // 次の秒境界ちょうどに発火: remaining が N*1000ms になり ceil で N に切り替わる
      const msUntilNext = remaining % 1000 || 1000;
      timeoutId = setTimeout(tick, msUntilNext);
    };

    tick();

    return () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [patient.isRunning, patient.endTime]);

  const patientName =
    patient.roomNumber || patient.bedNumber
      ? `${patient.roomNumber || "---"}号室 ${patient.bedNumber || "-"}番ベッド`
      : "新規患者";

  const remainingText = formatRemainingTime(localRemainingTime);
  const endTimeText = patient.endTime ? formatTime(new Date(patient.endTime)) : null;

  // アクセシビリティ用ラベル
  const accessibilityDescription = patient.isRunning
    ? `${patientName}、${patient.status.label}、残り${remainingText || "不明"}`
    : `${patientName}、${patient.status.label}`;

  const isRunningCard = patient.isRunning || patient.status.id === "ending_soon";

  return (
    <TouchableOpacity
      style={[styles.card, isRunningCard && styles.cardRunning]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityDescription}
      accessibilityHint="タップして患者詳細を表示"
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {patientName}
        </Text>
        <StatusBadge status={patient.status} />
      </View>

      <View style={styles.details}>
        {patient.isRunning ? (
          <>
            <Text style={styles.remaining}>残り {remainingText || "--:--"}</Text>
            {endTimeText && <Text style={styles.endTime}>終了予定 {endTimeText}</Text>}
          </>
        ) : (
          <Text style={styles.info}>
            {patient.volume ? `${patient.volume}mL` : "未設定"}
            {patient.hours || patient.minutes
              ? ` / ${patient.hours || 0}時間${patient.minutes || 0}分`
              : ""}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardRunning: {
    backgroundColor: "#E3F2FD",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSize.medium,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remaining: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.primary,
  },
  endTime: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  info: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
  },
});
