import { renderHook, act } from "@testing-library/react-native";
import { useCalculation } from "./useCalculation";
import { INFUSION_SETS } from "../../../constants/infusionSets";

describe("useCalculation", () => {
  describe("初期状態", () => {
    test("入力は空で始まる", () => {
      const { result } = renderHook(() => useCalculation());

      expect(result.current.volume).toBe("");
      expect(result.current.hours).toBe("");
      expect(result.current.minutes).toBe("");
    });

    test("デフォルトは成人用輸液セット", () => {
      const { result } = renderHook(() => useCalculation());

      expect(result.current.infusionSet).toEqual(INFUSION_SETS.ADULT);
    });

    test("空入力時の計算値はゼロ/null", () => {
      const { result } = renderHook(() => useCalculation());

      expect(result.current.totalMinutes).toBe(0);
      expect(result.current.dropsPerMinute).toBe(0);
      expect(result.current.dropInterval).toBe(0);
      expect(result.current.totalDrops).toBe(0);
      expect(result.current.endTime).toBeNull();
      expect(result.current.isValid).toBe(false);
    });
  });

  describe("入力セッター", () => {
    test("setVolumeで輸液量が更新される", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
      });

      expect(result.current.volume).toBe("500");
    });

    test("setHoursで時間が更新される", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setHours("2");
      });

      expect(result.current.hours).toBe("2");
    });

    test("setMinutesで分が更新される", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setMinutes("30");
      });

      expect(result.current.minutes).toBe("30");
    });

    test("setInfusionSetで輸液セットが更新される", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setInfusionSet(INFUSION_SETS.PEDIATRIC);
      });

      expect(result.current.infusionSet).toEqual(INFUSION_SETS.PEDIATRIC);
    });
  });

  describe("計算値", () => {
    test("500mL/2h 成人用: 正しい滴下数/分", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setHours("2");
      });

      expect(result.current.totalMinutes).toBe(120);
      expect(result.current.dropsPerMinute).toBeCloseTo(83.333, 2);
    });

    test("100mL/1h 小児用: 正しい滴下数/分", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("100");
        result.current.setHours("1");
        result.current.setInfusionSet(INFUSION_SETS.PEDIATRIC);
      });

      expect(result.current.totalMinutes).toBe(60);
      expect(result.current.dropsPerMinute).toBe(100);
    });

    test("総滴下数が正しく計算される", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
      });

      expect(result.current.totalDrops).toBe(10000);
    });

    test("滴下間隔が正しく計算される", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setHours("2");
      });

      expect(result.current.dropInterval).toBeCloseTo(720, 0);
    });

    test("時間と分が正しく合算される", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setHours("1");
        result.current.setMinutes("30");
      });

      expect(result.current.totalMinutes).toBe(90);
    });

    test("totalMinutes > 0 の場合endTimeが設定される", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-15T10:00:00"));

      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setHours("2");
      });

      expect(result.current.endTime).not.toBeNull();
      expect(result.current.endTime!.getHours()).toBe(12);

      jest.useRealTimers();
    });

    test("totalMinutes = 0 の場合endTimeはnull", () => {
      const { result } = renderHook(() => useCalculation());

      expect(result.current.endTime).toBeNull();
    });
  });

  describe("isValid", () => {
    test("輸液量が空の場合false", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setHours("1");
      });

      expect(result.current.isValid).toBe(false);
    });

    test("時間が空の場合false", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
      });

      expect(result.current.isValid).toBe(false);
    });

    test("両方設定時true", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setHours("2");
      });

      expect(result.current.isValid).toBe(true);
    });

    test("輸液量0の場合false", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("0");
        result.current.setHours("2");
      });

      expect(result.current.isValid).toBe(false);
    });
  });

  describe("reset", () => {
    test("全入力を初期状態にリセットする", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setHours("2");
        result.current.setMinutes("30");
        result.current.setInfusionSet(INFUSION_SETS.PEDIATRIC);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.volume).toBe("");
      expect(result.current.hours).toBe("");
      expect(result.current.minutes).toBe("");
      expect(result.current.infusionSet).toEqual(INFUSION_SETS.ADULT);
      expect(result.current.isValid).toBe(false);
    });
  });

  describe("輸液量バリデーション (上限: 3000 mL)", () => {
    test("3000mLは有効 (境界値)", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("3000");
        result.current.setHours("4");
      });

      expect(result.current.validationError).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    test("3001mLはエラー (境界値超過)", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("3001");
        result.current.setHours("1");
      });

      expect(result.current.validationError).toBe("輸液量は3000 mL以下にしてください");
    });

    test("1mLは有効 (下限境界値)", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("1");
        result.current.setHours("1");
      });

      expect(result.current.validationError).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    test("9999mLはエラー (4桁上限値)", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("9999");
        result.current.setHours("24");
      });

      expect(result.current.validationError).toContain("3000 mL以下");
    });
  });

  describe("投与時間バリデーション (最小15分, 最大1440分)", () => {
    test("15分は有効 (下限境界値)", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("100");
        result.current.setMinutes("15");
      });

      expect(result.current.validationError).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    test("14分はエラー (下限未満)", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setMinutes("14");
      });

      expect(result.current.validationError).toBe("投与時間は15分以上にしてください");
    });

    test("1分はエラー", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setMinutes("1");
      });

      expect(result.current.validationError).toContain("15分以上");
    });

    test("1440分(24時間)は有効 (上限境界値)", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setHours("24");
      });

      expect(result.current.validationError).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    test("1441分はエラー (上限超過)", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setHours("24");
        result.current.setMinutes("1");
      });

      expect(result.current.validationError).toBe("投与時間は24時間以下にしてください");
    });

    test("0時間15分の組み合わせで有効", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("100");
        result.current.setHours("0");
        result.current.setMinutes("15");
      });

      expect(result.current.validationError).toBeNull();
    });

    test("0時間14分の組み合わせでエラー", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setHours("0");
        result.current.setMinutes("14");
      });

      expect(result.current.validationError).toContain("15分以上");
    });
  });

  describe("滴下速度バリデーション (上限: 300滴/分)", () => {
    test("300滴/分ちょうどは有効 (境界値)", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("1500");
        result.current.setHours("1");
        result.current.setMinutes("40");
      });

      expect(result.current.dropsPerMinute).toBe(300);
      expect(result.current.validationError).toBeNull();
    });

    test("300超はエラー", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("1500");
        result.current.setHours("1");
        result.current.setMinutes("39");
      });

      expect(result.current.validationError).toContain("300滴/分を超えています");
    });

    test("小児用セットで高速滴下はエラー", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setInfusionSet(INFUSION_SETS.PEDIATRIC);
        result.current.setVolume("1000");
        result.current.setHours("1");
      });

      expect(result.current.validationError).toContain("300滴/分を超えています");
    });

    test("エラーメッセージに対処方法が含まれる", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setInfusionSet(INFUSION_SETS.PEDIATRIC);
        result.current.setVolume("1000");
        result.current.setHours("1");
      });

      expect(result.current.validationError).toContain(
        "輸液量を減らすか投与時間を延ばしてください"
      );
    });
  });

  describe("初期状態 / 空入力時のバリデーション", () => {
    test("初期状態ではエラーなし", () => {
      const { result } = renderHook(() => useCalculation());

      expect(result.current.validationError).toBeNull();
    });

    test("輸液量のみ入力時はエラーなし", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
      });

      expect(result.current.validationError).toBeNull();
      expect(result.current.isValid).toBe(false);
    });

    test("時間のみ入力(有効な時間)ではエラーなし", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setHours("1");
      });

      expect(result.current.validationError).toBeNull();
      expect(result.current.isValid).toBe(false);
    });

    test("時間のみ入力で15分未満はエラー", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setMinutes("5");
      });

      expect(result.current.validationError).toContain("15分以上");
    });

    test("リセット後はエラーなし", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("5000");
        result.current.setHours("1");
      });

      expect(result.current.validationError).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.validationError).toBeNull();
    });
  });

  describe("isValid とバリデーションエラーの連動", () => {
    test("正常入力時はisValid=true", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setHours("2");
      });

      expect(result.current.isValid).toBe(true);
      expect(result.current.validationError).toBeNull();
    });

    test("エラー発生時はisValid=false", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("5000");
        result.current.setHours("1");
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError).not.toBeNull();
    });

    test("エラー修正でisValid=trueに戻る", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("5000");
        result.current.setHours("1");
      });

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setVolume("500");
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe("臨床シナリオ", () => {
    test("典型的な成人点滴: 500mL/2時間", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("500");
        result.current.setHours("2");
      });

      expect(result.current.isValid).toBe(true);
      expect(result.current.dropsPerMinute).toBeCloseTo(83.33, 1);
    });

    test("大量輸液: 3000mL/24時間", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("3000");
        result.current.setHours("24");
      });

      expect(result.current.isValid).toBe(true);
      expect(result.current.dropsPerMinute).toBeCloseTo(41.67, 1);
    });

    test("小児少量: 100mL/1時間", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setInfusionSet(INFUSION_SETS.PEDIATRIC);
        result.current.setVolume("100");
        result.current.setHours("1");
      });

      expect(result.current.isValid).toBe(true);
    });

    test("過剰速度: 3000mL/15分", () => {
      const { result } = renderHook(() => useCalculation());

      act(() => {
        result.current.setVolume("3000");
        result.current.setMinutes("15");
      });

      expect(result.current.isValid).toBe(false);
      expect(result.current.validationError).not.toBeNull();
    });
  });
});
