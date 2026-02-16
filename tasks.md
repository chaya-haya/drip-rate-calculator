# タスク: プロトタイプ → 本番プロジェクト移行

## 前提
- プロトタイプ（`/Users/mac/Desktop/code`）の点滴滴下数計算アプリを本番（`/Users/mac/Desktop/pro`）にリファクタリング移行
- @react-navigation → Expo Router、テスト co-locate、feature ベース構成

## Phase 1: プロジェクト基盤 ✅
- [x] 1.1 Expo プロジェクト初期化（package.json, app.config.ts, tsconfig.json, npm install）
- [x] 1.2 Jest 設定（jest.config.js, jest.setup.js）
- [x] 1.3 型定義の移行（types/） ※navigation.ts は Expo Router 化のため除外
- [x] 1.4 定数・テーマの移行（constants/） ※theme.ts を constants/ に統合

## Phase 2: ビジネスロジック移行 - TDD ✅
- [x] 2.1 計算ロジック（features/calculation/logic.test.ts → logic.ts）50テスト
- [x] 2.2 ストレージサービス（lib/storage.test.ts → storage.ts）19テスト
- [x] 2.3 通知サービス（lib/notification.test.ts → notification.ts）14テスト
- [x] 2.4 患者ステータスロジック抽出（features/patients/logic.test.ts → logic.ts）10テスト

## Phase 3: カスタムフック移行
- [x] 3.1 useCalculation（features/calculation/hooks/）46テスト
- [x] 3.2 useDripAnimation（features/calculation/hooks/）15テスト
- [x] 3.3 useNotification（hooks/）

## Phase 4: Context Provider 移行 ✅
- [x] 4.1 PatientsContext（12テスト）
- [x] 4.2 PresetsContext（7テスト）
- [x] 4.3 NotificationContext（10テスト）
- [x] 4.4 AppProvider（全Context束ね）

## Phase 5: UI コンポーネント移行 ✅
- [x] 5.1 共有コンポーネント → components/（11個移行済み: StatusBadge, PatientCard, PatientIdentifier, InputForm, InfusionSetSelector, ResultDisplay, DripAnimation, HapticControl, NotificationControl, PresetCard, SavePresetModal）
- [x] 5.2 機能固有コンポーネント → features/*/components/ ※プロトタイプに機能固有サブコンポーネントなし。画面はPhase 6で移行

## Phase 6: Expo Router ナビゲーション構築 ✅
- [x] 6.1 ルートレイアウト・タブレイアウト（app/_layout.tsx, app/(tabs)/_layout.tsx）
- [x] 6.2 タブ画面（app/(tabs)/index.tsx 患者一覧, app/(tabs)/presets.tsx プリセット一覧）
- [x] 6.3 詳細・モーダル画面（app/patient/[id].tsx, app/preset/create.tsx, app/preset/[id].tsx）

## Phase 7: Watch Connectivity ✅
- [x] 7.1 watch-connectivity モジュールコピー（modules/watch-connectivity/ TS+Swift+podspec）
- [x] 7.2 useWatchSync フック移行（src/hooks/useWatchSync.ts importパス更新済み）
- [x] 7.3 型テスト移行（src/hooks/useWatchSync.test.ts 2テスト PASS）

## Phase 8: Watch ターゲット ✅
- [x] 8.1 watchOS アプリコピー（targets/watch/ 全15ファイル: DripWatchApp, Models, ViewModels, Views, Utilities, Assets, config）

## Phase 9: 統合・検証 ✅
- [x] 9.1 EAS Build 設定（eas.json作成、ビルドスクリプト追加）
- [x] 9.2 全テスト実行・最終検証（11スイート / 206テスト ALL PASS）
- [x] 9.3 Discord通知テスト
