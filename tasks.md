# タスク: プロトタイプ → 本番プロジェクト移行

## 前提
- プロトタイプ（`/Users/mac/Desktop/code`）の点滴滴下数計算アプリを本番（`/Users/mac/Desktop/pro`）にリファクタリング移行
- @react-navigation → Expo Router、テスト co-locate、feature ベース構成

## Phase 1: プロジェクト基盤
- [x] 1.1 Expo プロジェクト初期化（package.json, app.config.ts, tsconfig.json, npm install）
- [x] 1.2 Jest 設定（jest.config.js, jest.setup.js）
- [x] 1.3 型定義の移行（types/）
- [x] 1.4 定数・テーマの移行（constants/）

## Phase 2: ビジネスロジック移行 - TDD
- [ ] 2.1 計算ロジック（features/calculation/logic.test.ts → logic.ts）
- [ ] 2.2 ストレージサービス（lib/storage.test.ts → storage.ts）
- [ ] 2.3 通知サービス（lib/notification.test.ts → notification.ts）
- [ ] 2.4 患者ステータスロジック抽出（features/patients/logic.test.ts → logic.ts）

## Phase 3: カスタムフック移行
- [ ] 3.1 useCalculation（features/calculation/hooks/）
- [ ] 3.2 useDripAnimation（features/calculation/hooks/）
- [ ] 3.3 useNotification（hooks/）

## Phase 4: Context Provider 移行
- [ ] 4.1 PatientsContext
- [ ] 4.2 PresetsContext
- [ ] 4.3 NotificationContext

## Phase 5: UI コンポーネント移行
- [ ] 5.1 共有コンポーネント → components/
- [ ] 5.2 機能固有コンポーネント → features/*/components/

## Phase 6: Expo Router ナビゲーション構築
- [ ] 6.1 ルートレイアウト・タブレイアウト
- [ ] 6.2 タブ画面
- [ ] 6.3 詳細・モーダル画面

## Phase 7: Watch Connectivity
- [ ] 7.1 watch-connectivity モジュールコピー
- [ ] 7.2 watchSync 移行 + WatchSyncBridge 復帰

## Phase 8: Watch ターゲット
- [ ] 8.1 watchOS アプリコピー + 共有スキーマ

## Phase 9: 統合・検証
- [ ] 9.1 EAS Build 設定
- [ ] 9.2 全テスト実行・最終検証
