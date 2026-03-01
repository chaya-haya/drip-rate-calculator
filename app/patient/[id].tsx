import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { usePatients } from "../../src/contexts/PatientsContext";
import { usePresets } from "../../src/contexts/PresetsContext";
import { useNotifications } from "../../src/contexts/NotificationContext";

import { PatientIdentifier } from "../../src/components/PatientIdentifier";
import { InfusionSetSelector } from "../../src/components/InfusionSetSelector";
import { InputForm } from "../../src/components/InputForm";
import { ResultDisplay } from "../../src/components/ResultDisplay";
import { DripAnimation } from "../../src/components/DripAnimation";
import { NotificationControl } from "../../src/components/NotificationControl";
import { HapticControl } from "../../src/components/HapticControl";
import { SavePresetModal } from "../../src/components/SavePresetModal";
import { UnsavedBadge, UnsavedErrorNotice } from "../../src/components/UnsavedStatus";

import { useCalculation } from "../../src/features/calculation/hooks/useCalculation";
import { HAPTIC_INTENSITY } from "../../src/features/calculation/hooks/useDripAnimation";
import { calculateEndTime } from "../../src/features/calculation/logic";

import { colors, spacing, fontSize, commonStyles } from "../../src/constants/theme";
import type { NotificationTimingOption, HapticIntensity, PresetCreateData } from "../../src/types";

// 患者詳細・編集画面
export default function PatientDetailScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    getPatient,
    updatePatient,
    deletePatient,
    startPatient,
    stopPatient,
    isSaving,
    saveError,
    retrySavePatients,
  } = usePatients();
  const { addPreset, isSaving: isSavingPreset } = usePresets();
  const { scheduleForPatient, cancelForPatient, hasPermission, ensurePermission } = useNotifications();

  const patient = getPatient(patientId!);

  // フォーム状態
  const [roomNumber, setRoomNumber] = useState("");
  const [bedNumber, setBedNumber] = useState("");

  const {
    volume,
    setVolume,
    hours,
    setHours,
    minutes,
    setMinutes,
    infusionSet,
    setInfusionSet,
    totalMinutes,
    dropsPerMinute,
    dropInterval,
    totalDrops,
    isValid,
    validationError,
  } = useCalculation();

  // 通知・ハプティック設定
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationTiming, setNotificationTiming] = useState<NotificationTimingOption>({
    id: "10",
    label: "10分前",
    minutes: 10,
  });
  const [hapticEnabled, setHapticEnabled] = useState(false);
  const [hapticIntensity, setHapticIntensity] = useState<HapticIntensity>(HAPTIC_INTENSITY.MEDIUM);

  // 投与中状態
  const [isRunning, setIsRunning] = useState(false);
  const [fixedEndTime, setFixedEndTime] = useState<Date | null>(null);

  // プリセット保存モーダル
  const [showPresetModal, setShowPresetModal] = useState(false);

  // 保存済みの値（変更検知の基準点）
  const originalValues = useRef<{
    roomNumber: string;
    bedNumber: string;
    volume: string;
    hours: string;
    minutes: string;
    infusionSet: typeof infusionSet;
    notificationEnabled: boolean;
    notificationTiming: NotificationTimingOption;
    hapticEnabled: boolean;
    hapticIntensity: HapticIntensity;
  } | null>(null);

  // 患者データの読み込み
  useEffect(() => {
    if (patient) {
      setRoomNumber(patient.roomNumber || "");
      setBedNumber(patient.bedNumber || "");
      setVolume(patient.volume || "");
      setHours(patient.hours || "");
      setMinutes(patient.minutes || "");
      setInfusionSet(patient.infusionSet);
      setNotificationEnabled(patient.notificationEnabled || false);
      setNotificationTiming(
        patient.notificationTiming || { id: "10", label: "10分前", minutes: 10 }
      );
      setHapticEnabled(patient.hapticEnabled || false);
      setHapticIntensity(patient.hapticIntensity || HAPTIC_INTENSITY.MEDIUM);
      setIsRunning(patient.isRunning || false);
      if (patient.endTime) {
        setFixedEndTime(new Date(patient.endTime));
      }

      // 保存済み値を記録（変更検知の基準点）
      originalValues.current = {
        roomNumber: patient.roomNumber || "",
        bedNumber: patient.bedNumber || "",
        volume: patient.volume || "",
        hours: patient.hours || "",
        minutes: patient.minutes || "",
        infusionSet: patient.infusionSet,
        notificationEnabled: patient.notificationEnabled || false,
        notificationTiming: patient.notificationTiming || {
          id: "10",
          label: "10分前",
          minutes: 10,
        },
        hapticEnabled: patient.hapticEnabled || false,
        hapticIntensity: patient.hapticIntensity || HAPTIC_INTENSITY.MEDIUM,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- patientオブジェクト全体を依存に入れると無限ループするため、IDのみで制御
  }, [patient?.id]);

  // 変更有無の検知
  const hasChanges = useMemo(() => {
    const orig = originalValues.current;
    if (!orig) return false;
    return (
      roomNumber !== orig.roomNumber ||
      bedNumber !== orig.bedNumber ||
      volume !== orig.volume ||
      hours !== orig.hours ||
      minutes !== orig.minutes ||
      infusionSet !== orig.infusionSet ||
      notificationEnabled !== orig.notificationEnabled ||
      notificationTiming.id !== orig.notificationTiming.id ||
      hapticEnabled !== orig.hapticEnabled ||
      hapticIntensity !== orig.hapticIntensity
    );
  }, [
    roomNumber,
    bedNumber,
    volume,
    hours,
    minutes,
    infusionSet,
    notificationEnabled,
    notificationTiming,
    hapticEnabled,
    hapticIntensity,
  ]);

  // 表示用終了時刻
  const displayEndTime = useMemo(() => {
    if (isRunning && fixedEndTime) {
      return fixedEndTime;
    }
    if (totalMinutes <= 0) return null;
    return calculateEndTime(totalMinutes);
  }, [isRunning, fixedEndTime, totalMinutes]);

  // 保存
  const handleSave = async () => {
    return updatePatient(patientId!, {
      roomNumber,
      bedNumber,
      volume,
      hours,
      minutes,
      infusionSet,
      notificationEnabled,
      notificationTiming,
      hapticEnabled,
      hapticIntensity,
    });
  };

  // 戻る（変更がなければダイアログをスキップ）
  const handleBackWithConfirmation = () => {
    if (saveError && !isSaving) {
      Alert.alert(
        "未保存の変更があります",
        "保存に失敗した変更があります。このまま戻ると、端末再起動後に失われる可能性があります。",
        [
          {
            text: "そのまま戻る",
            style: "destructive",
            onPress: () => router.back(),
          },
          { text: "キャンセル", style: "cancel" },
          {
            text: "保存を再試行",
            onPress: async () => {
              await retrySavePatients();
            },
          },
        ]
      );
      return;
    }

    // 変更がなければダイアログをスキップして一覧へ戻る
    if (!hasChanges) {
      router.back();
      return;
    }

    Alert.alert("設定の保存", "変更を保存しますか？", [
      {
        text: "保存しない",
        style: "destructive",
        onPress: () => router.back(),
      },
      { text: "キャンセル", style: "cancel" },
      {
        text: "保存",
        onPress: async () => {
          const saved = await handleSave();
          if (saved) {
            router.back();
          }
        },
      },
    ]);
  };

  // 開始
  const handleStart = async () => {
    const endTime = calculateEndTime(totalMinutes);
    setFixedEndTime(endTime);
    setIsRunning(true);

    // フォームデータを保存してから、開始処理を共通経路で実行する
    const settingsSaved = await updatePatient(patientId!, {
      roomNumber,
      bedNumber,
      volume,
      hours,
      minutes,
      infusionSet,
      notificationEnabled,
      notificationTiming,
      hapticEnabled,
      hapticIntensity,
    });
    const startedSaved = await startPatient(patientId!, endTime);

    if (settingsSaved && startedSaved) {
      router.back();
    }
  };

  // 停止
  const handleStop = async () => {
    setIsRunning(false);
    setFixedEndTime(null);

    await stopPatient(patientId!);
  };

  // 削除
  const handleDelete = () => {
    Alert.alert("患者の削除", "この患者を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          await cancelForPatient(patientId!);
          const saved = await deletePatient(patientId!);
          if (saved) {
            router.back();
          }
        },
      },
    ]);
  };

  // プリセット保存
  const handleSavePreset = async (presetData: PresetCreateData): Promise<boolean> => {
    const result = await addPreset(presetData);
    return result.saved;
  };

  // 通知トグル
  const handleToggleNotification = async (enabled: boolean) => {
    if (enabled && !hasPermission) {
      const granted = await ensurePermission();
      if (!granted) {
        Alert.alert(
          "通知を有効にできません",
          "終了通知を利用するには、まずiPhone側で通知を許可してください。"
        );
        return;
      }
    }

    setNotificationEnabled(enabled);

    if (enabled && isRunning && fixedEndTime) {
      await scheduleForPatient(patientId!, fixedEndTime, notificationTiming.minutes);
    } else {
      await cancelForPatient(patientId!);
    }
  };

  // 通知タイミング変更
  const handleTimingChange = async (timing: NotificationTimingOption) => {
    setNotificationTiming(timing);

    if (notificationEnabled && isRunning && fixedEndTime) {
      await scheduleForPatient(patientId!, fixedEndTime, timing.minutes);
    }
  };

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.errorBackButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>患者が見つかりません</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackWithConfirmation}
          accessibilityRole="button"
          accessibilityLabel="戻る"
        >
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            患者設定
          </Text>
          <UnsavedBadge visible={Boolean(saveError)} />
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 点滴アニメーション・計算結果 */}
          <View style={commonStyles.card}>
            <UnsavedErrorNotice error={saveError} isSaving={isSaving} onRetry={retrySavePatients} />
            <DripAnimation
              dropInterval={dropInterval}
              isActive={isValid}
              hapticEnabled={hapticEnabled}
              hapticIntensity={hapticIntensity}
            />
            <ResultDisplay
              dropsPerMinute={dropsPerMinute}
              totalDrops={totalDrops}
              totalMinutes={totalMinutes}
              endTime={displayEndTime}
              isValid={isValid}
            />

            {/* バリデーションエラー（投与中は非表示） */}
            {validationError && !isRunning && (
              <View style={styles.validationErrorContainer}>
                <Text style={styles.validationErrorText}>{validationError}</Text>
              </View>
            )}

            {/* スタートボタン: isValid かつ 未実行のとき */}
            {isValid && !isRunning && (
              <View style={styles.controlButtons}>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStart}
                  disabled={isSaving}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="投与を開始"
                  accessibilityState={{ disabled: isSaving }}
                >
                  <Text style={styles.startButtonText}>{isSaving ? "保存中..." : "スタート"}</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* ストップボタン: isRunning のとき常に表示（isValid に依存させない） */}
            {isRunning && (
              <View style={styles.controlButtons}>
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={handleStop}
                  disabled={isSaving}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="投与を停止"
                  accessibilityState={{ disabled: isSaving }}
                >
                  <Text style={styles.stopButtonText}>{isSaving ? "保存中..." : "ストップ"}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 患者識別 */}
          <View style={commonStyles.card}>
            {isRunning && (
              <View style={styles.lockedBanner}>
                <Text style={styles.lockedBannerText}>
                  投与中は設定を変更できません。変更するにはストップしてください。
                </Text>
              </View>
            )}
            <PatientIdentifier
              roomNumber={roomNumber}
              onRoomNumberChange={setRoomNumber}
              bedNumber={bedNumber}
              onBedNumberChange={setBedNumber}
              disabled={isRunning}
            />
          </View>

          {/* 点滴設定 */}
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>点滴設定</Text>

            {/* プリセットボタン */}
            {!isRunning && (
              <View style={styles.presetButtons}>
                {isValid && (
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => setShowPresetModal(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.presetButtonText}>現在値を保存</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <InfusionSetSelector
              selectedSet={infusionSet}
              onSelectSet={setInfusionSet}
              disabled={isRunning}
            />

            <InputForm
              volume={volume}
              onVolumeChange={setVolume}
              hours={hours}
              onHoursChange={setHours}
              minutes={minutes}
              onMinutesChange={setMinutes}
              disabled={isRunning}
            />

            {/* 振動フィードバック */}
            <HapticControl
              isEnabled={hapticEnabled}
              onToggle={setHapticEnabled}
              intensity={hapticIntensity}
              onIntensityChange={setHapticIntensity}
              isValid={isValid}
            />

            {/* 通知制御 */}
            <NotificationControl
              isEnabled={notificationEnabled}
              selectedTiming={notificationTiming}
              hasPermission={hasPermission}
              onToggle={handleToggleNotification}
              onTimingChange={handleTimingChange}
              endTime={displayEndTime}
              isValid={isValid}
            />
          </View>

          {/* 削除ボタン */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isSaving}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="この患者を削除"
            accessibilityState={{ disabled: isSaving }}
          >
            <Text style={styles.deleteButtonText}>
              {isSaving ? "保存中..." : "この患者を削除"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* プリセット保存モーダル */}
      <SavePresetModal
        visible={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        onSave={handleSavePreset}
        isSaving={isSavingPreset}
        currentSettings={{
          infusionSet,
          volume,
          hours,
          minutes,
        }}
      />
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
  titleRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  sectionTitle: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  presetButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetButton: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: "center",
  },
  presetButtonText: {
    color: colors.primaryDark,
    fontSize: fontSize.small,
    fontWeight: "600",
  },
  controlButtons: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: "center",
  },
  startButtonText: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.textLight,
  },
  stopButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: "center",
  },
  stopButtonText: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.textLight,
  },
  deleteButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: fontSize.medium,
    color: colors.error,
  },
  errorText: {
    fontSize: fontSize.medium,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  errorBackButton: {
    padding: spacing.md,
  },
  validationErrorContainer: {
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  validationErrorText: {
    fontSize: fontSize.small,
    color: "#E65100",
    textAlign: "center",
  },
  lockedBanner: {
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  lockedBannerText: {
    fontSize: fontSize.small,
    color: "#E65100",
    textAlign: "center",
  },
});
