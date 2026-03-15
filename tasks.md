# iOS リリース準備チェックリスト

## Phase 0: アプリ名変更

- [x] `app.config.ts` の `name` を `"てきかる"` に変更
- [x] `targets/watch/Info.plist` の `CFBundleDisplayName` を `"てきかる"` に変更

## Phase 1: 設定ファイルの修正

- [x] `app.config.ts` の `bundleIdentifier` を `com.kayakaya.dripcalculator` に変更
- [x] `targets/watch/Info.plist` の `WKCompanionAppBundleIdentifier` も合わせて更新
- [ ] `eas.json` の submit 認証情報の入力（ユーザー作業: appleId / ascAppId / appleTeamId）

## Phase 2: App Store Connect メタデータ（ユーザー作業）

- [ ] スクリーンショット撮影・アップロード（iPhone 6.9" + Apple Watch）
- [ ] プライバシーポリシー URL 登録
- [ ] Support URL 登録
- [ ] App Privacy 申告（「データを収集しない」を選択）
- [ ] 配信地域を「日本のみ」に設定
- [ ] 年齢レーティング質問票に回答

## Phase 3: Codex レビュー（チャット回答）

- [x] 設定変更後の審査視点レビュー（下記に記載）

## 現在の状態

Phase 0・Phase 1（コード変更分）完了。
Phase 2 はすべてユーザーが App Store Connect 上で行う作業。
Phase 3 レビューは本ファイル下部に記載。

---

## Phase 3: 審査視点レビュー結果

### 前回レポート（2026-03-03）からの差分

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| アプリ名 | 点滴滴下数計算 | てきかる |
| Bundle ID | com.dripcalculator.app | com.kayakaya.dripcalculator |
| Watch 表示名 | DripWatch | てきかる |
| Watch Companion Bundle ID | com.dripcalculator.app | com.kayakaya.dripcalculator |

### 残存リスク

**🔴 必須（提出前に必ず対応）**
- スクリーンショット未アップロード（提出フォームで弾かれる）
- プライバシーポリシー URL 未設定（提出フォームで弾かれる）
- App Privacy 未申告（提出フォームで弾かれる）

**🟡 推奨（審査通過率に影響）**
- eas.json の submit 認証情報が空欄 → `eas submit` 実行時に都度 CLI で入力すれば回避可能
- 配信地域がデフォルト（全世界）のまま → UI が日本語専用のため、グローバル配信は審査で指摘される可能性あり
- 年齢レーティング未回答 → 提出前に必ず質問票に回答すること

**🟢 問題なし（前回レポートから変化なし）**
- 医療免責事項の表示: 対応済み
- エラーハンドリング: 対応済み
- デバッグコード除去: 対応済み
- PrivacyInfo.xcprivacy: 対応済み
- ITSAppUsesNonExemptEncryption: false（App Store暗号化申告不要）
- NSPrivacyAccessedAPITypes: 4種類すべて宣言済み
