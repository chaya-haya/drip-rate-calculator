import React from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useDripAnimation, HAPTIC_INTENSITY } from "../features/calculation/hooks/useDripAnimation";
import { colors, spacing } from "../constants/theme";
import type { HapticIntensity } from "../types";

interface DripAnimationProps {
  dropInterval: number;
  isActive?: boolean;
  hapticEnabled?: boolean;
  hapticIntensity?: HapticIntensity;
}

// 点滴アニメーションコンポーネント
export const DripAnimation: React.FC<DripAnimationProps> = ({
  dropInterval,
  isActive = true,
  hapticEnabled = false,
  hapticIntensity = HAPTIC_INTENSITY.MEDIUM,
}) => {
  const { dropPosition, dropOpacity, isAnimating } = useDripAnimation(
    dropInterval,
    isActive,
    hapticEnabled,
    hapticIntensity
  );

  // 落下距離
  const FALL_DISTANCE = 120;

  const translateY = dropPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FALL_DISTANCE],
  });

  // 落下中にやや縦長になる変形
  const scaleY = dropPosition.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const scaleX = dropPosition.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.85, 1],
  });

  return (
    <View style={styles.container}>
      {/* 点滴ボトル（簡略化） */}
      <View style={styles.bottle}>
        <View style={styles.bottleBody} />
        <View style={styles.bottleNeck} />
      </View>

      {/* 点滴チャンバー */}
      <View style={styles.chamber}>
        <View style={styles.chamberInner}>
          {/* 液面 */}
          <View style={styles.liquidLevel} />

          {/* 滴 */}
          {isAnimating && (
            <Animated.View
              style={[
                styles.drop,
                {
                  transform: [{ translateY }, { scaleX }, { scaleY }],
                  opacity: dropOpacity,
                },
              ]}
            />
          )}
        </View>
      </View>

      {/* チューブ */}
      <View style={styles.tube} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  bottle: {
    alignItems: "center",
  },
  bottleBody: {
    width: 60,
    height: 40,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  bottleNeck: {
    width: 20,
    height: 15,
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.primary,
  },
  chamber: {
    width: 50,
    height: 150,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    overflow: "hidden",
  },
  chamberInner: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  liquidLevel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: colors.droplet,
    opacity: 0.5,
  },
  drop: {
    position: "absolute",
    top: 10,
    width: 16,
    height: 20,
    backgroundColor: colors.droplet,
    borderRadius: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: colors.dropletDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  tube: {
    width: 8,
    height: 30,
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.primary,
  },
});
