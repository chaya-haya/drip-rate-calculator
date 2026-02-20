// 開発環境でのみコンソール出力するロガー
// リリースビルドではconsole出力を抑制する

/* eslint-disable no-console */

const noop = (..._args: unknown[]): void => {};

export const logger = {
  warn: __DEV__ ? (...args: unknown[]) => console.warn(...args) : noop,
  error: __DEV__ ? (...args: unknown[]) => console.error(...args) : noop,
};
