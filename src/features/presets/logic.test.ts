import { createPreset, updatePresetData } from "./logic";
import type { Preset, PresetCreateData, PresetUpdateData } from "../../types";

describe("createPreset", () => {
  const baseData: PresetCreateData = {
    name: "テストプリセット",
    infusionSet: { id: "adult", name: "成人用", dropsPerMl: 20, description: "成人用輸液セット" },
    volume: "500",
    hours: "2",
    minutes: "30",
  };

  test("IDとタイムスタンプ付きのPresetオブジェクトを生成する", () => {
    const now = "2024-01-15T10:00:00.000Z";
    const result = createPreset("preset-1", baseData, now);

    expect(result).toEqual({
      id: "preset-1",
      name: "テストプリセット",
      infusionSet: { id: "adult", name: "成人用", dropsPerMl: 20, description: "成人用輸液セット" },
      volume: "500",
      hours: "2",
      minutes: "30",
      createdAt: now,
      updatedAt: now,
    });
  });

  test("元のデータを変更しない（不変性）", () => {
    const dataCopy = { ...baseData };
    createPreset("preset-1", baseData, "2024-01-15T10:00:00.000Z");

    expect(baseData).toEqual(dataCopy);
  });
});

describe("updatePresetData", () => {
  const existingPreset: Preset = {
    id: "preset-1",
    name: "元の名前",
    infusionSet: { id: "adult", name: "成人用", dropsPerMl: 20, description: "成人用輸液セット" },
    volume: "500",
    hours: "2",
    minutes: "30",
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  };

  test("指定フィールドを更新しupdatedAtを設定する", () => {
    const updates: PresetUpdateData = { name: "新しい名前", volume: "1000" };
    const now = "2024-01-15T12:00:00.000Z";
    const result = updatePresetData(existingPreset, updates, now);

    expect(result).toEqual({
      ...existingPreset,
      name: "新しい名前",
      volume: "1000",
      updatedAt: now,
    });
  });

  test("idとcreatedAtは変更されない", () => {
    const updates: PresetUpdateData = { name: "変更" };
    const now = "2024-01-15T12:00:00.000Z";
    const result = updatePresetData(existingPreset, updates, now);

    expect(result.id).toBe(existingPreset.id);
    expect(result.createdAt).toBe(existingPreset.createdAt);
  });

  test("元のプリセットを変更しない（不変性）", () => {
    const presetCopy = { ...existingPreset };
    updatePresetData(existingPreset, { name: "変更" }, "2024-01-15T12:00:00.000Z");

    expect(existingPreset).toEqual(presetCopy);
  });
});
