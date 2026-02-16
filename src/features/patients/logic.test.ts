import { calculatePatientStatus, calculateRemainingTime } from "./logic";
import { PATIENT_STATUS } from "../../constants/infusionSets";
import type { Patient } from "../../types/patient";

// テスト用の基本患者データ
const createMockPatient = (overrides: Partial<Patient> = {}): Patient => ({
  id: "patient-1",
  roomNumber: "101",
  bedNumber: "A",
  infusionSet: {
    id: "adult",
    name: "成人用",
    dropsPerMl: 20,
    description: "20滴/mL",
  },
  volume: "500",
  hours: "2",
  minutes: "0",
  isRunning: false,
  startedAt: null,
  endTime: null,
  notificationEnabled: false,
  notificationTiming: { id: "5", label: "5分前", minutes: 5 },
  hapticEnabled: false,
  hapticIntensity: "medium",
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
  ...overrides,
});

describe("calculatePatientStatus", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("未実行の患者は待機中ステータスを返す", () => {
    const patient = createMockPatient({ isRunning: false });
    expect(calculatePatientStatus(patient)).toEqual(PATIENT_STATUS.WAITING);
  });

  test("endTimeがnullの場合は待機中ステータスを返す", () => {
    const patient = createMockPatient({ isRunning: true, endTime: null });
    expect(calculatePatientStatus(patient)).toEqual(PATIENT_STATUS.WAITING);
  });

  test("終了時刻を過ぎた場合は完了ステータスを返す", () => {
    const patient = createMockPatient({
      isRunning: true,
      endTime: "2024-01-15T09:00:00.000Z", // 1時間前
    });
    expect(calculatePatientStatus(patient)).toEqual(PATIENT_STATUS.COMPLETED);
  });

  test("残り5分以内の場合は終了間近ステータスを返す", () => {
    const patient = createMockPatient({
      isRunning: true,
      endTime: "2024-01-15T10:03:00.000Z", // 3分後
    });
    expect(calculatePatientStatus(patient)).toEqual(PATIENT_STATUS.ENDING_SOON);
  });

  test("残り5分ちょうどの場合は終了間近ステータスを返す", () => {
    const patient = createMockPatient({
      isRunning: true,
      endTime: "2024-01-15T10:05:00.000Z", // 5分後
    });
    expect(calculatePatientStatus(patient)).toEqual(PATIENT_STATUS.ENDING_SOON);
  });

  test("残り5分超の場合は実行中ステータスを返す", () => {
    const patient = createMockPatient({
      isRunning: true,
      endTime: "2024-01-15T12:00:00.000Z", // 2時間後
    });
    expect(calculatePatientStatus(patient)).toEqual(PATIENT_STATUS.RUNNING);
  });
});

describe("calculateRemainingTime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("実行中の場合は残り時間（ミリ秒）を返す", () => {
    const patient = createMockPatient({
      isRunning: true,
      endTime: "2024-01-15T12:00:00.000Z", // 2時間後
    });
    expect(calculateRemainingTime(patient)).toBe(2 * 60 * 60 * 1000);
  });

  test("終了済みの場合は0を返す", () => {
    const patient = createMockPatient({
      isRunning: true,
      endTime: "2024-01-15T09:00:00.000Z", // 1時間前
    });
    expect(calculateRemainingTime(patient)).toBe(0);
  });

  test("未実行の場合はnullを返す", () => {
    const patient = createMockPatient({ isRunning: false });
    expect(calculateRemainingTime(patient)).toBeNull();
  });

  test("endTimeがnullの場合はnullを返す", () => {
    const patient = createMockPatient({ isRunning: true, endTime: null });
    expect(calculateRemainingTime(patient)).toBeNull();
  });
});
