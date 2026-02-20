import { useEffect, useRef, useCallback, useState } from "react";
import { Animated, Easing } from "react-native";
import * as Haptics from "expo-haptics";
import { ANIMATION_CONFIG } from "../../../constants/infusionSets";
import type { HapticIntensity, UseDripAnimationReturn } from "../../../types/hooks";

// 型モジュールからre-export
export { HAPTIC_INTENSITY } from "../../../types/hooks";

/**
 * 点滴アニメーション制御フック（ハプティックフィードバック対応）
 */
export const useDripAnimation = (
  dropInterval: number,
  isActive: boolean = true,
  hapticEnabled: boolean = false,
  hapticIntensity: HapticIntensity = "medium"
): UseDripAnimationReturn => {
  const dropPosition = useRef(new Animated.Value(0)).current;
  const dropOpacity = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // アニメーション間隔の最小値制限
  const effectiveInterval = Math.max(dropInterval, ANIMATION_CONFIG.MIN_INTERVAL_MS);

  // ハプティックフィードバック
  const triggerHaptic = useCallback(async () => {
    if (!hapticEnabled) return;
    try {
      const styleMap: Record<HapticIntensity, Haptics.ImpactFeedbackStyle> = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      await Haptics.impactAsync(styleMap[hapticIntensity]);
    } catch {
      // ハプティック非対応デバイスでは無視
    }
  }, [hapticEnabled, hapticIntensity]);

  // 1滴分のアニメーション
  const animateDrop = useCallback(() => {
    dropPosition.setValue(0);
    dropOpacity.setValue(1);

    // 滴下開始時にハプティック発火
    triggerHaptic();

    // 落下時間はインターバルの80%
    const fallDuration = effectiveInterval * 0.8;

    const animation = Animated.parallel([
      // 重力加速を模したイージングで落下
      Animated.timing(dropPosition, {
        toValue: 1,
        duration: fallDuration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      // 落下の最後にフェードアウト
      Animated.sequence([
        Animated.delay(fallDuration * 0.7),
        Animated.timing(dropOpacity, {
          toValue: 0,
          duration: fallDuration * 0.3,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished && isActive && effectiveInterval > 0) {
        // 次の滴下までの待機時間
        const waitTime = effectiveInterval - fallDuration;
        animationRef.current = setTimeout(
          () => {
            animateDrop();
          },
          Math.max(waitTime, 50)
        );
      }
    });
  }, [dropPosition, dropOpacity, effectiveInterval, isActive, triggerHaptic]);

  // アニメーションの開始・停止制御
  useEffect(() => {
    if (isActive && effectiveInterval > 0 && dropInterval > 0) {
      setIsAnimating(true);
      animateDrop();
    } else {
      setIsAnimating(false);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      dropPosition.stopAnimation();
      dropOpacity.stopAnimation();
      dropPosition.setValue(0);
      dropOpacity.setValue(1);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      dropPosition.stopAnimation();
      dropOpacity.stopAnimation();
    };
  }, [isActive, effectiveInterval, dropInterval, animateDrop, dropPosition, dropOpacity]);

  return {
    dropPosition,
    dropOpacity,
    isAnimating,
    effectiveInterval,
  };
};
