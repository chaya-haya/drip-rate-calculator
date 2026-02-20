import {
  calculateDropsPerMinute,
  hoursToMinutes,
  calculateDropInterval,
  calculateTotalDrops,
  calculateEndTime,
  formatTime,
} from "./logic";
import { MEDICAL_SCENARIOS } from "./medicalScenarios";

describe("calculateDropsPerMinute", () => {
  describe("標準計算シナリオ", () => {
    test("500mL/2時間/成人用(20滴/mL) = 83.33滴/分", () => {
      const result = calculateDropsPerMinute(500, 120, 20);
      expect(result).toBeCloseTo(83.333, 2);
    });

    test("100mL/1時間/小児用(60滴/mL) = 100滴/分", () => {
      const result = calculateDropsPerMinute(100, 60, 60);
      expect(result).toBe(100);
    });

    test("250mL/30分/成人用 = 166.67滴/分", () => {
      const result = calculateDropsPerMinute(250, 30, 20);
      expect(result).toBeCloseTo(166.667, 2);
    });

    test("1000mL/8時間/成人用 = 41.67滴/分", () => {
      const result = calculateDropsPerMinute(1000, 480, 20);
      expect(result).toBeCloseTo(41.667, 2);
    });
  });

  describe("エッジケース - ゼロ値", () => {
    test("輸液量0は0を返す", () => {
      expect(calculateDropsPerMinute(0, 60, 20)).toBe(0);
    });

    test("投与時間0は0を返す（ゼロ除算回避）", () => {
      expect(calculateDropsPerMinute(500, 0, 20)).toBe(0);
    });

    test("滴下係数0は0を返す", () => {
      expect(calculateDropsPerMinute(500, 60, 0)).toBe(0);
    });

    test("全てゼロは0を返す", () => {
      expect(calculateDropsPerMinute(0, 0, 0)).toBe(0);
    });
  });

  describe("エッジケース - 負の値", () => {
    test("負の輸液量は0を返す", () => {
      expect(calculateDropsPerMinute(-500, 60, 20)).toBe(0);
    });

    test("負の投与時間は0を返す", () => {
      expect(calculateDropsPerMinute(500, -60, 20)).toBe(0);
    });

    test("負の滴下係数は0を返す", () => {
      expect(calculateDropsPerMinute(500, 60, -20)).toBe(0);
    });
  });

  describe("エッジケース - 大きな値", () => {
    test("非常に大きな輸液量でも正しく計算", () => {
      const result = calculateDropsPerMinute(10000, 60, 20);
      expect(result).toBeCloseTo(3333.333, 2);
    });

    test("非常に短い時間(1分)でも正しく計算", () => {
      const result = calculateDropsPerMinute(100, 1, 20);
      expect(result).toBe(2000);
    });

    test("非常に長い時間(24時間)でも正しく計算", () => {
      const result = calculateDropsPerMinute(1000, 1440, 20);
      expect(result).toBeCloseTo(13.889, 2);
    });
  });

  describe("浮動小数点精度", () => {
    test("循環小数を正確に処理", () => {
      const result = calculateDropsPerMinute(100, 60, 20);
      expect(result).toBeCloseTo(33.333, 3);
    });

    test("小さな小数点輸液量でも精度を維持", () => {
      const result = calculateDropsPerMinute(0.5, 60, 20);
      expect(result).toBeCloseTo(0.167, 3);
    });

    test("複雑な分数でも精度を維持", () => {
      const result = calculateDropsPerMinute(333, 77, 20);
      expect(result).toBeCloseTo(86.494, 2);
    });
  });

  describe("医療リファレンスシナリオ - 成人", () => {
    test.each(MEDICAL_SCENARIOS.adult)(
      "$name = $expectedRounded滴/分（四捨五入）",
      ({ volume, timeMinutes, dropsPerMl, expectedDropsPerMin, expectedRounded }) => {
        const result = calculateDropsPerMinute(volume, timeMinutes, dropsPerMl);
        expect(result).toBeCloseTo(expectedDropsPerMin, 1);
        expect(Math.round(result)).toBe(expectedRounded);
      }
    );
  });

  describe("医療リファレンスシナリオ - 小児", () => {
    test.each(MEDICAL_SCENARIOS.pediatric)(
      "$name = $expectedRounded滴/分（四捨五入）",
      ({ volume, timeMinutes, dropsPerMl, expectedDropsPerMin, expectedRounded }) => {
        const result = calculateDropsPerMinute(volume, timeMinutes, dropsPerMl);
        expect(result).toBeCloseTo(expectedDropsPerMin, 1);
        expect(Math.round(result)).toBe(expectedRounded);
      }
    );
  });
});

describe("hoursToMinutes", () => {
  test("1時間 = 60分", () => {
    expect(hoursToMinutes(1, 0)).toBe(60);
  });

  test("2時間30分 = 150分", () => {
    expect(hoursToMinutes(2, 30)).toBe(150);
  });

  test("0時間45分 = 45分", () => {
    expect(hoursToMinutes(0, 45)).toBe(45);
  });

  test("8時間0分 = 480分", () => {
    expect(hoursToMinutes(8, 0)).toBe(480);
  });

  test("分のデフォルト値は0", () => {
    expect(hoursToMinutes(3)).toBe(180);
  });

  test("小数の時間も処理可能", () => {
    expect(hoursToMinutes(1.5, 0)).toBe(90);
  });
});

describe("calculateDropInterval", () => {
  test("60滴/分 = 1000ms間隔", () => {
    expect(calculateDropInterval(60)).toBe(1000);
  });

  test("120滴/分 = 500ms間隔", () => {
    expect(calculateDropInterval(120)).toBe(500);
  });

  test("30滴/分 = 2000ms間隔", () => {
    expect(calculateDropInterval(30)).toBe(2000);
  });

  test("0滴/分は0を返す（ゼロ除算回避）", () => {
    expect(calculateDropInterval(0)).toBe(0);
  });

  test("負の滴下数は0を返す", () => {
    expect(calculateDropInterval(-10)).toBe(0);
  });

  test("高速: 300滴/分 = 200ms間隔", () => {
    expect(calculateDropInterval(300)).toBe(200);
  });

  test("低速: 10滴/分 = 6000ms間隔", () => {
    expect(calculateDropInterval(10)).toBe(6000);
  });
});

describe("calculateTotalDrops", () => {
  test("500mL/成人用 = 10000滴", () => {
    expect(calculateTotalDrops(500, 20)).toBe(10000);
  });

  test("100mL/小児用 = 6000滴", () => {
    expect(calculateTotalDrops(100, 60)).toBe(6000);
  });

  test("輸液量0 = 0滴", () => {
    expect(calculateTotalDrops(0, 20)).toBe(0);
  });

  test("1000mL/成人用 = 20000滴", () => {
    expect(calculateTotalDrops(1000, 20)).toBe(20000);
  });
});

describe("calculateEndTime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T10:00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("10:00から60分後 = 11:00", () => {
    const endTime = calculateEndTime(60);
    expect(endTime.getHours()).toBe(11);
    expect(endTime.getMinutes()).toBe(0);
  });

  test("10:00から120分後 = 12:00", () => {
    const endTime = calculateEndTime(120);
    expect(endTime.getHours()).toBe(12);
    expect(endTime.getMinutes()).toBe(0);
  });

  test("10:00から90分後 = 11:30", () => {
    const endTime = calculateEndTime(90);
    expect(endTime.getHours()).toBe(11);
    expect(endTime.getMinutes()).toBe(30);
  });

  test("日付跨ぎを正しく処理", () => {
    jest.setSystemTime(new Date("2024-01-15T23:00:00"));
    const endTime = calculateEndTime(120);
    expect(endTime.getDate()).toBe(16);
    expect(endTime.getHours()).toBe(1);
  });
});

describe("formatTime", () => {
  test("午前の時刻をゼロパディング", () => {
    expect(formatTime(new Date("2024-01-15T09:05:00"))).toBe("09:05");
  });

  test("午後の時刻をフォーマット", () => {
    expect(formatTime(new Date("2024-01-15T14:30:00"))).toBe("14:30");
  });

  test("深夜0時をフォーマット", () => {
    expect(formatTime(new Date("2024-01-15T00:00:00"))).toBe("00:00");
  });

  test("正午をフォーマット", () => {
    expect(formatTime(new Date("2024-01-15T12:00:00"))).toBe("12:00");
  });
});
