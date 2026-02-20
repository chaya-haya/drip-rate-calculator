import type { WatchPatientData } from "../../modules/watch-connectivity/src/WatchConnectivityModule.types";
import { isWatchCommand } from "./useWatchSync";

describe("isWatchCommand", () => {
  test("有効なWatchCommandを受け入れる", () => {
    const valid = { type: "startInfusion", patientId: "patient-1", timestamp: 12345 };
    expect(isWatchCommand(valid)).toBe(true);
  });

  test("nullを拒否する", () => {
    expect(isWatchCommand(null)).toBe(false);
  });

  test("undefinedを拒否する", () => {
    expect(isWatchCommand(undefined)).toBe(false);
  });

  test("文字列を拒否する", () => {
    expect(isWatchCommand("invalid")).toBe(false);
  });

  test("数値を拒否する", () => {
    expect(isWatchCommand(42)).toBe(false);
  });

  test("typeが欠けているオブジェクトを拒否する", () => {
    expect(isWatchCommand({ patientId: "patient-1" })).toBe(false);
  });

  test("patientIdが欠けているオブジェクトを拒否する", () => {
    expect(isWatchCommand({ type: "startInfusion" })).toBe(false);
  });

  test("typeが文字列でないオブジェクトを拒否する", () => {
    expect(isWatchCommand({ type: 123, patientId: "patient-1" })).toBe(false);
  });

  test("patientIdが文字列でないオブジェクトを拒否する", () => {
    expect(isWatchCommand({ type: "startInfusion", patientId: 123 })).toBe(false);
  });

  test("空オブジェクトを拒否する", () => {
    expect(isWatchCommand({})).toBe(false);
  });
});

describe("WatchPatientData type contract", () => {
  const baseData: Omit<WatchPatientData, "hapticEnabled"> = {
    id: "patient-1",
    roomNumber: "101",
    bedNumber: "A",
    infusionSetType: "adult",
    dropsPerMl: 20,
    volume: 500,
    totalMinutes: 120,
    isRunning: true,
    startedAt: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T12:00:00Z",
    dropsPerMinute: 83.33,
    dropInterval: 720,
  };

  test("hapticEnabled: true のオブジェクトが型を満たす", () => {
    const data: WatchPatientData = { ...baseData, hapticEnabled: true };

    expect(data.hapticEnabled).toBe(true);
  });

  test("hapticEnabled: false のオブジェクトが型を満たす", () => {
    const data: WatchPatientData = { ...baseData, hapticEnabled: false };

    expect(data.hapticEnabled).toBe(false);
  });
});
