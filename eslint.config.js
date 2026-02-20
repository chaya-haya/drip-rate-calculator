// @ts-check
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: ["dist/", "ios/", "android/", "node_modules/", ".expo/"],
  },
  // 本番コードでのconsole使用を禁止（loggerを使うこと）
  {
    files: ["src/**/*.ts", "src/**/*.tsx", "app/**/*.ts", "app/**/*.tsx"],
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-console": "error",
    },
  },
  // テストファイル・Jest設定ファイル用のグローバル変数
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "jest.setup.js"],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
  },
];
