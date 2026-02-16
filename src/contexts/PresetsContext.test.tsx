import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { PresetsProvider, usePresets } from "./PresetsContext";
import { savePresets, loadPresets } from "../lib/storage";
import { INFUSION_SETS } from "../constants/infusionSets";

jest.mock("../lib/storage", () => ({
  savePresets: jest.fn().mockResolvedValue({ success: true }),
  loadPresets: jest.fn().mockResolvedValue({ success: true, data: [] }),
}));

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "mock-preset-uuid"),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PresetsProvider>{children}</PresetsProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  (loadPresets as jest.Mock).mockResolvedValue({ success: true, data: [] });
});

describe("PresetsContext", () => {
  describe("usePresets outside provider", () => {
    test("Provider外で使うとエラー", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => usePresets());
      }).toThrow("usePresets must be used within a PresetsProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("初期状態", () => {
    test("空のプリセットリストで開始", async () => {
      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.presets).toEqual([]);
    });

    test("ストレージからプリセットを読み込む", async () => {
      const storedPresets = [
        {
          id: "stored-preset",
          name: "生理食塩水",
          infusionSet: INFUSION_SETS.ADULT,
          volume: "500",
          hours: "2",
          minutes: "0",
          createdAt: "2024-01-15T10:00:00.000Z",
          updatedAt: "2024-01-15T10:00:00.000Z",
        },
      ];
      (loadPresets as jest.Mock).mockResolvedValue({
        success: true,
        data: storedPresets,
      });

      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.presets).toHaveLength(1);
      });

      expect(result.current.presets[0].name).toBe("生理食塩水");
    });
  });

  describe("addPreset", () => {
    test("新しいプリセットを追加", async () => {
      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newPreset: any;
      await act(async () => {
        newPreset = await result.current.addPreset({
          name: "テストプリセット",
          infusionSet: INFUSION_SETS.PEDIATRIC,
          volume: "100",
          hours: "1",
          minutes: "30",
        });
      });

      expect(newPreset.name).toBe("テストプリセット");
      expect(newPreset.infusionSet).toEqual(INFUSION_SETS.PEDIATRIC);
      expect(result.current.presets).toHaveLength(1);
      expect(savePresets).toHaveBeenCalled();
    });
  });

  describe("updatePreset", () => {
    test("既存のプリセットを更新", async () => {
      (loadPresets as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "update-me",
            name: "旧名前",
            infusionSet: INFUSION_SETS.ADULT,
            volume: "500",
            hours: "2",
            minutes: "0",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
      });

      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.presets).toHaveLength(1);
      });

      await act(async () => {
        await result.current.updatePreset("update-me", { name: "新名前" });
      });

      expect(result.current.presets[0].name).toBe("新名前");
      expect(savePresets).toHaveBeenCalled();
    });
  });

  describe("deletePreset", () => {
    test("プリセットを削除", async () => {
      (loadPresets as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "delete-me",
            name: "テスト",
            infusionSet: INFUSION_SETS.ADULT,
            volume: "500",
            hours: "2",
            minutes: "0",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
      });

      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.presets).toHaveLength(1);
      });

      await act(async () => {
        await result.current.deletePreset("delete-me");
      });

      expect(result.current.presets).toHaveLength(0);
      expect(savePresets).toHaveBeenCalled();
    });
  });

  describe("getPreset", () => {
    test("IDでプリセットを取得", async () => {
      (loadPresets as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "find-me",
            name: "テスト",
            infusionSet: INFUSION_SETS.ADULT,
            volume: "500",
            hours: "2",
            minutes: "0",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
      });

      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.presets).toHaveLength(1);
      });

      expect(result.current.getPreset("find-me")?.name).toBe("テスト");
    });

    test("存在しないIDはundefined", async () => {
      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getPreset("nonexistent")).toBeUndefined();
    });
  });
});
