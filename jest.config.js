module.exports = {
  preset: "jest-expo",
  // co-locate パターン: テストファイルは対象ファイルと同階層に配置
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  setupFiles: ["./jest.setup.js"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/types/**",
    "!**/node_modules/**",
  ],
};
