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

    test("読み込み失敗時はloadErrorを設定", async () => {
      (loadPresets as jest.Mock).mockResolvedValue({
        success: false,
        data: [],
      });

      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.loadError).toBe("プリセットの読み込みに失敗しました。");
    });

    test("保存失敗時はsaveErrorを設定", async () => {
      (savePresets as jest.Mock).mockResolvedValueOnce({ success: false });

      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addPreset({
          name: "テスト",
          infusionSet: INFUSION_SETS.ADULT,
          volume: "500",
          hours: "1",
          minutes: "0",
        });
      });

      expect(result.current.saveError?.message).toBe("プリセットの保存に失敗しました。");
      expect(result.current.saveError?.reason).toBe("ローカルストレージへの保存に失敗しました。");
    });

    test("retrySavePresetsで現在のstateを再保存できる", async () => {
      (savePresets as jest.Mock)
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addPreset({
          name: "テスト",
          infusionSet: INFUSION_SETS.ADULT,
          volume: "500",
          hours: "1",
          minutes: "0",
        });
      });

      await act(async () => {
        await result.current.retrySavePresets();
      });

      expect(savePresets).toHaveBeenCalledTimes(2);
      expect(result.current.saveError).toBeNull();
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

      expect(newPreset.preset.name).toBe("テストプリセット");
      expect(newPreset.preset.infusionSet).toEqual(INFUSION_SETS.PEDIATRIC);
      expect(newPreset.saved).toBe(true);
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

  describe("reloadPresets", () => {
    test("再読み込みで最新データを取得", async () => {
      const { result } = renderHook(() => usePresets(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      (loadPresets as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: "reloaded-preset",
            name: "再読込",
            infusionSet: INFUSION_SETS.ADULT,
            volume: "500",
            hours: "2",
            minutes: "0",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
      });

      await act(async () => {
        await result.current.reloadPresets();
      });

      expect(result.current.loadError).toBeNull();
      expect(result.current.presets).toHaveLength(1);
      expect(result.current.presets[0].id).toBe("reloaded-preset");
    });
  });
});
