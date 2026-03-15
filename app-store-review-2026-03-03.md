# App Store 審査レビュー（最終版）

## 点滴滴下数計算（Drip Rate Calculator）v1.0.0

> レビュー実施日: 2026-03-03
> 調査対象: iOS (Expo / React Native 0.81.5) + watchOS (SwiftUI)
> 審査員視点: Apple Review Team / Health & Fitness カテゴリ担当
> Codex レビュー v1・v2 の指摘をすべて反映済み

---

## Codex ディスカッション記録

### v1 レビューで修正した点
- **H-1「watchOS NSPrivacyAccessedAPITypes 未宣言」は誤り → 削除**
  - 宣言先は `Info.plist` ではなく `PrivacyInfo.xcprivacy`
  - `project.pbxproj` および `DripWatch.app/PrivacyInfo.xcprivacy` で対応済みを確認

- **スクリーンショットを LOW → HIGH に昇格**
  - App Store Connect への提出自体がスクリーンショットなしでは完了しない必須メタデータ

### v2 レビューで修正した点
- **年齢レーティング「17+」の前提を削除**
  - 2026年1月31日以降は質問票から自動算出に変更（区分: 4+/9+/13+/16+/18+）
  - 「17+」という固定値は現行制度に存在しない

- **「iPhone / Watch それぞれ申告」の誤りを修正**
  - App Store Connect の App Privacy 回答は app-level（across all platforms）
  - Watch 向けの別エントリは存在しない

---

## 総合判定

**Requires Metadata Changes（条件付き承認 — App Store Connect 設定完了後に承認見込み）**

コードレベルの重大な問題なし。残る課題はすべて App Store Connect 側の設定・コンテンツ準備。

---

## Guideline 別評価

| Guideline | 内容 | 判定 |
|-----------|------|------|
| **1.4** | Medical Disclaimers | ✅ Pass |
| **2.1** | App Completeness | ✅ Pass |
| **3.1** | Payments | ✅ Pass（非該当） |
| **4.0** | Design / HIG | ✅ Pass |
| **5.1** | Privacy | ✅ Pass（watchOS `PrivacyInfo.xcprivacy` 対応済みを確認） |
| **5.2** | Medical Devices | ✅ Pass |
| **10.0** | Apple Watch | ✅ Pass |

---

## リジェクトリスク

### 🔴 HIGH（提出前に必須）

#### H-1. スクリーンショット未準備
- **影響**: App Store Connect への申請自体が完了しない
- **要件**:
  - iPhone 6.9"（必須）
  - iPhone 6.5"（6.9" を提出した場合は任意）
  - Apple Watch（Watch アプリ公開時は必須）
- **対応**: 実機またはシミュレーターで撮影・アップロード

#### H-2. App Store Connect メタデータ未設定
- プライバシーポリシー URL（医療カテゴリで必須）
- Support URL（申請フォームの必須フィールド）
- App Privacy 申告（「データを収集しない」を選択 — **iPhone/Watch 共通で1件、プラットフォーム別設定は不要**）

---

### 🟡 MEDIUM（差し戻しリスクあり・早期対応推奨）

| # | 内容 | 対応 |
|---|------|------|
| M-1 | UI が日本語専用なのに配信地域未設定 | App Store Connect で「日本のみ」に限定 |
| M-2 | 年齢レーティング未設定 | **質問票に回答して算出**（現行制度は 4+/9+/13+/16+/18+、医療補助ツールは 13+ または 16+ が予想値） |

---

### 🟢 LOW（承認には影響しないが整備推奨）

- `eas.json` の `submit.production` フィールドが空（appleId / ascAppId / appleTeamId）
- watchOS `deploymentTarget: "10.0"` の設定は実コードの `NavigationStack`（watchOS 7+で利用可能）と整合していることを確認済み。ビルドが通っているなら問題なし

---

## 強みポイント（承認に有利な要素）

### ✅ 医療免責事項が徹底されている
- 初回起動時に強制表示モーダル（同意前は操作不可）
- 設定タブから再閲覧・再同意のリセット機能
- 「医療機器ではない」「最終判断は医療従事者が行う」を明記

### ✅ プライバシー設計が明確かつ完全
- 外部通信ゼロ（fetch / axios 等なし）
- `ios/app/PrivacyInfo.xcprivacy` と watchOS の `PrivacyInfo.xcprivacy` 両方対応済み
- プライバシーポリシーページをアプリ内に実装し「外部送信なし」を明文化

### ✅ Watch 単独動作を技術的に保証
- 前回同期キャッシュで iPhone 非接続でも動作
- 毎秒タイマーによるカウントダウン・ハプティック通知が Watch ローカルで動作
- NumericMemoView は完全ローカル（AppStorage のみ）

### ✅ エラーハンドリングが医療用途水準
- ローディング / エラー / 空状態の 3 状態すべてハンドリング済み
- 保存エラー時は「失敗時刻・原因・再試行ボタン」を表示

### ✅ デバッグコード除去が構造的に保証
- `logger.ts` の `__DEV__` ガードで本番ビルドから自動除去

---

## 対応優先マップ（最終版）

```
【提出前・必須】（HIGH）
1. スクリーンショット撮影・アップロード
   - iPhone 6.9"（必須）、Watch 用（必須）
2. App Store Connect でプライバシーポリシー URL・Support URL を登録
3. App Privacy 申告（「データを収集しない」— 1件のみ、全プラットフォーム共通）

【提出前・推奨】（MEDIUM）
4. 配信地域を「日本のみ」に設定
5. 年齢レーティング質問票に回答（算出結果を確認・適用）

【整備推奨】（LOW）
6. eas.json に appleId / ascAppId / appleTeamId を記入
```
