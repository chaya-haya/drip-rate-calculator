/* eslint-disable @typescript-eslint/no-require-imports */
import { renderHook, act } from "@testing-library/react-native";
import { Animated } from "react-native";
import { useDripAnimation, HAPTIC_INTENSITY } from "./useDripAnimation";

// expo-hapticsのモック
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "Light",
    Medium: "Medium",
    Heavy: "Heavy",
  },
}));

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useDripAnimation", () => {
  describe("HAPTIC_INTENSITY定数", () => {
    test("light, medium, heavyの値を持つ", () => {
      expect(HAPTIC_INTENSITY.LIGHT).toBe("light");
      expect(HAPTIC_INTENSITY.MEDIUM).toBe("medium");
      expect(HAPTIC_INTENSITY.HEAVY).toBe("heavy");
    });
  });

  describe("初期状態", () => {
    test("dropPositionがAnimated.Valueのインスタンスである", () => {
      const { result } = renderHook(() => useDripAnimation(1000, false));

      expect(result.current.dropPosition).toBeInstanceOf(Animated.Value);
    });

    test("dropOpacityがAnimated.Valueのインスタンスである", () => {
      const { result } = renderHook(() => useDripAnimation(1000, false));

      expect(result.current.dropOpacity).toBeInstanceOf(Animated.Value);
    });

    test("非アクティブ時にisAnimatingがfalseである", () => {
      const { result } = renderHook(() => useDripAnimation(1000, false));

      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe("effectiveInterval（最小間隔制御）", () => {
    test("dropIntervalが最小値以上ならそのまま使用する", () => {
      const { result } = renderHook(() => useDripAnimation(1000, false));

      expect(result.current.effectiveInterval).toBe(1000);
    });

    test("最小値未満なら200msにクランプする", () => {
      const { result } = renderHook(() => useDripAnimation(100, false));

      expect(result.current.effectiveInterval).toBe(200);
    });

    test("dropIntervalが0のとき200msにクランプする", () => {
      const { result } = renderHook(() => useDripAnimation(0, false));

      expect(result.current.effectiveInterval).toBe(200);
    });
  });

  describe("アニメーション有効化", () => {
    test("アクティブかつ有効なintervalでisAnimatingがtrueになる", () => {
      const { result } = renderHook(() => useDripAnimation(1000, true));

      expect(result.current.isAnimating).toBe(true);
    });

    test("dropIntervalが0のときisAnimatingがfalseになる", () => {
      const { result } = renderHook(() => useDripAnimation(0, true));

      expect(result.current.isAnimating).toBe(false);
    });

    test("非アクティブに切り替えるとisAnimatingがfalseになる", () => {
      const { result, rerender } = renderHook(
        ({ interval, active }: { interval: number; active: boolean }) =>
          useDripAnimation(interval, active),
        { initialProps: { interval: 1000, active: true } }
      );

      expect(result.current.isAnimating).toBe(true);

      rerender({ interval: 1000, active: false });

      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe("ハプティックフィードバック", () => {
    const Haptics = require("expo-haptics");

    beforeEach(() => {
      Haptics.impactAsync.mockClear();
    });

    test("有効時にアニメーション開始でハプティックが発火する", async () => {
      renderHook(() => useDripAnimation(1000, true, true, HAPTIC_INTENSITY.MEDIUM));

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith("Medium");
    });

    test("無効時にはハプティックが発火しない", async () => {
      renderHook(() => useDripAnimation(1000, true, false, HAPTIC_INTENSITY.MEDIUM));

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    test("lightスタイルが正しく適用される", async () => {
      renderHook(() => useDripAnimation(1000, true, true, HAPTIC_INTENSITY.LIGHT));

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith("Light");
    });

    test("heavyスタイルが正しく適用される", async () => {
      renderHook(() => useDripAnimation(1000, true, true, HAPTIC_INTENSITY.HEAVY));

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith("Heavy");
    });
  });

  describe("クリーンアップ", () => {
    test("アンマウント時にエラーが発生しない", () => {
      const { unmount } = renderHook(() => useDripAnimation(1000, true));

      expect(() => unmount()).not.toThrow();
    });
  });
});
