// loggerユーティリティのテスト
// __DEV__フラグに応じてconsole出力を制御する

/* eslint-disable @typescript-eslint/no-require-imports */

describe("logger", () => {
  let originalDev: boolean;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    // @ts-expect-error -- テスト用にグローバル変数を保存
    originalDev = globalThis.__DEV__;
    warnSpy = jest.spyOn(console, "warn").mockImplementation();
    errorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    // @ts-expect-error -- テスト用にグローバル変数を復元
    globalThis.__DEV__ = originalDev;
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    jest.resetModules();
  });

  describe("__DEV__ === true の場合", () => {
    beforeEach(() => {
      // @ts-expect-error -- テスト用にグローバル変数を設定
      globalThis.__DEV__ = true;
    });

    it("logger.warn が console.warn を呼ぶ", () => {
      const { logger } = require("./logger");
      logger.warn("テスト警告", { detail: 1 });
      expect(warnSpy).toHaveBeenCalledWith("テスト警告", { detail: 1 });
    });

    it("logger.error が console.error を呼ぶ", () => {
      const { logger } = require("./logger");
      logger.error("テストエラー", new Error("test"));
      expect(errorSpy).toHaveBeenCalledWith("テストエラー", new Error("test"));
    });
  });

  describe("__DEV__ === false の場合", () => {
    beforeEach(() => {
      // @ts-expect-error -- テスト用にグローバル変数を設定
      globalThis.__DEV__ = false;
    });

    it("logger.warn が console.warn を呼ばない", () => {
      const { logger } = require("./logger");
      logger.warn("テスト警告");
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("logger.error が console.error を呼ばない", () => {
      const { logger } = require("./logger");
      logger.error("テストエラー");
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe("引数の受け渡し", () => {
    beforeEach(() => {
      // @ts-expect-error -- テスト用にグローバル変数を設定
      globalThis.__DEV__ = true;
    });

    it("複数の引数がそのままconsoleに渡される", () => {
      const { logger } = require("./logger");
      logger.warn("a", "b", "c");
      expect(warnSpy).toHaveBeenCalledWith("a", "b", "c");
    });

    it("引数なしでも呼び出せる", () => {
      const { logger } = require("./logger");
      logger.error();
      expect(errorSpy).toHaveBeenCalledWith();
    });
  });
});
