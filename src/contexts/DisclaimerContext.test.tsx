import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { DisclaimerProvider, useDisclaimer } from "./DisclaimerContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DisclaimerProvider>{children}</DisclaimerProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DisclaimerContext", () => {
  test("acceptで同意状態を保存する", async () => {
    const { result } = renderHook(() => useDisclaimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.accept();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith("@drip_calculator/disclaimer_accepted", "true");
    expect(result.current.isAccepted).toBe(true);
  });

  test("resetAcceptanceで保存済み同意状態を削除する", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("true");
    const { result } = renderHook(() => useDisclaimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAccepted).toBe(true);
    });

    act(() => {
      result.current.resetAcceptance();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@drip_calculator/disclaimer_accepted");
    expect(result.current.isAccepted).toBe(false);
  });

  test("reset後に再マウントしても未同意のまま", async () => {
    const { result, unmount } = renderHook(() => useDisclaimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.accept();
    });

    act(() => {
      result.current.resetAcceptance();
    });

    unmount();

    const remounted = renderHook(() => useDisclaimer(), { wrapper });

    await waitFor(() => {
      expect(remounted.result.current.isLoaded).toBe(true);
    });

    expect(remounted.result.current.isAccepted).toBe(false);
  });
});
