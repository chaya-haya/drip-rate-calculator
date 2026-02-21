# App Store 審査対応レポート

> 対象アプリ: 点滴滴下数計算（DripWatch）
> 調査日: 2026-02-21
> 調査対象: iOS アプリ（Expo/React Native）+ watchOS アプリ（Swift/SwiftUI）

---

## 審査対応ステータス一覧

| # | 優先度 | 審査項目 | ステータス | ガイドライン |
|---|--------|---------|-----------|------------|
| 1 | 🔴 HIGH | 医療アプリの免責事項 | **未実装** | 1.4.1 / 5.1.1 |
| 2 | 🔴 HIGH | aps-environment が development のまま | **要確認** | 2.1 |
| 3 | 🟡 MEDIUM | エラー画面にナビゲーション手段がない | **未対応** | 4.0 / HIG |
| 4 | 🟡 MEDIUM | プライバシーポリシー URL の未登録 | **未対応** | 5.1.1 |
| 5 | 🟡 MEDIUM | Watch アプリの Privacy Nutrition Label 未申告 | **未申告** | 5.1 / 10.0 |
| 6 | 🟡 MEDIUM | NSPrivacyAccessedAPITypes 宣言不足の可能性 | **要確認** | 5.1 |
| 7 | 🟡 MEDIUM | 日本語のみ対応（配信地域の未定義） | **要確認** | 2.3 |
| 8 | 🔵 LOW | スクリーンショットの準備不足 | **未準備** | 2.3 |
| 9 | 🔵 LOW | 年齢制限の設定 | **未設定** | 1.3 |
| 10 | 🔵 LOW | Support URL / Marketing URL の未設定 | **未設定** | App Store Connect |

---

## 問題なし（対応不要）

| 審査項目 | 結果 | 根拠 |
|---------|------|------|
| 外部サーバー通信 | ✅ なし | fetch/axios 等の使用なし |
| トラッキングSDK | ✅ なし | `NSPrivacyTracking: false` |
| WebView 丸投げ | ✅ なし | 全機能ネイティブUI実装 |
| 非公開API | ✅ なし | 標準Expo/Appleフレームワークのみ |
| 課金機能 | ✅ 非該当 | IAP 実装なし |
| デバッグコード | ✅ 制御済み | `logger.ts` で `__DEV__` ガード |
| プレースホルダー画面 | ✅ なし | 全画面実装済み |
| 未実装ボタン | ✅ なし | 全ボタン動作確認 |
| ローディング/空状態 | ✅ 実装済み | 各画面でハンドリング |
| Watch 単独機能 | ✅ 対応 | iPhone非依存でWatchが動作（Guideline 10.0） |

---

## 要対応項目の詳細と修正方針

---

### 🔴 HIGH（リジェクト可能性あり）

---

#### 1. 医療アプリの免責事項が未実装

**ガイドライン**: Guideline 1.4.1 / 5.1.1

**問題**:
点滴投与量・滴下数を計算する医療専門家向けツールにもかかわらず、アプリ内に免責事項（Disclaimer）が存在しない。Apple は医療・健康系アプリに対し、「医療専門家の判断を代替するものではない」旨の明示を要求している。

> Guideline 1.4.1: *"Medical, health, and fitness apps that could provide inaccurate data or be used for diagnosing or treating patients must provide a disclaimer."*

**現状コード**:
- `app/patient/[id].tsx`: 計算結果を表示しているが免責文言なし
- 初回起動時の同意画面なし
- 設定画面に免責事項ページなし

**修正方針**:
1. 初回起動時に免責事項確認ダイアログを表示する（`AsyncStorage` で同意済みフラグを保存）
2. 設定画面に「このアプリについて」または「免責事項」ページを追加する
3. 免責文言の例:
   > 「本アプリは医療専門家の補助ツールです。計算結果は参考値であり、実際の投薬判断は必ず医療従事者の責任において行ってください。」

---

#### 2. aps-environment が development のまま

**ガイドライン**: Guideline 2.1

**問題**:
`ios/app/app.entitlements`（L5-6）の `aps-environment` が `development` に設定されている。

```xml
<!-- ios/app/app.entitlements -->
<key>aps-environment</key>
<string>development</string>  <!-- ← production に変更が必要 -->
```

App Store 配布ビルドでは `production` である必要がある。EAS Build の production profile が自動的に上書きする場合もあるが、明示的な設定がないとビルド環境によっては通知機能が本番環境で動作しなくなる。

**修正方針**:
- EAS Build の production profile でこの値が `production` に自動変換されるか確認する
- `eas.json` の `production` プロファイルに `"credentialsSource": "remote"` が設定されているか確認する
- 安全のため、`ios/app/app.entitlements` を直接 `production` に変更することも検討する

---

### 🟡 MEDIUM（要対応）

---

#### 3. エラー画面にナビゲーション手段がない

**ガイドライン**: Guideline 4.0 / HIG（Human Interface Guidelines）

**問題**:
患者またはプリセットが見つからない場合のエラー画面に、前の画面へ戻る手段がない。ユーザーがアプリを強制終了しない限り操作不能になる（デッドエンド）。

**該当箇所**:

```tsx
// app/patient/[id].tsx L302-308
if (!patient) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.errorText}>患者が見つかりません</Text>
      {/* ← 戻るボタンがない */}
    </SafeAreaView>
  );
}
```

```tsx
// app/preset/[id].tsx L44-50
if (!preset) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.errorText}>プリセットが見つかりません</Text>
      {/* ← 戻るボタンがない */}
    </SafeAreaView>
  );
}
```

通常画面（`app/patient/[id].tsx` L313: `← 戻る`）には戻るボタンがあり、エラー画面だけ欠落している状態は HIG 的に不整合。

**修正方針**:
両エラー画面に `router.back()` を呼ぶ戻るボタンを追加する。

---

#### 4. プライバシーポリシー URL の未登録

**ガイドライン**: Guideline 5.1.1

**問題**:
医療・健康カテゴリのアプリは App Store Connect でのプライバシーポリシー URL 登録が**必須**。このアプリは患者の病室番号・ベッド番号・投薬情報（輸液量・投与時間）を扱うため、プライバシーポリシーなしは審査でリジェクト対象となる。

**現状**:
- アプリ内にプライバシーポリシーページが存在しない
- App Store Connect での URL 登録が未確認

**修正方針**:
1. プライバシーポリシーを記述したウェブページ（または GitHub Pages 等）を用意する
2. App Store Connect の「アプリ情報」でプライバシーポリシー URL を登録する
3. 任意でアプリ内設定画面にも「プライバシーポリシー」リンクを追加する

**記載すべき内容**:
- 収集する情報（病室番号・ベッド番号・投薬設定）はデバイス内のみに保存すること
- 外部サーバーへの送信は一切行わないこと
- データの保持・削除に関する方針

---

#### 5. Apple Watch アプリの Privacy Nutrition Label 未申告

**ガイドライン**: Guideline 5.1 / watchOS Guideline 10.0

**問題**:
App Store Connect では Watch アプリのプライバシー情報を **iPhone アプリとは別に** 申告する必要がある。Watch アプリ（DripWatch）は以下のデータを扱う。

**Watch アプリが扱うデータ**（`targets/watch/src/` 配下）:
- `WatchPatient.swift`: 患者データ（病室番号・ベッド番号・投薬情報）を UserDefaults に保存
- `WatchConnectivityManager.swift`: iPhone からのデータ同期
- `HapticManager.swift`: ハプティックフィードバック

**申告が必要な項目**（Watch 側）:
| カテゴリ | 用途 | リンク先 |
|---------|------|---------|
| Health & Fitness（投薬情報） | アプリ機能 | ユーザーと紐づけない |
| User Content（病室・ベッド番号） | アプリ機能 | ユーザーと紐づけない |

**修正方針**:
App Store Connect で Watch アプリの「プライバシー - データの収集」セクションを iPhone アプリと別に申告する。「データはデバイス外に送信されない」旨を選択できる。

---

#### 6. NSPrivacyAccessedAPITypes 宣言不足の可能性

**ガイドライン**: Guideline 5.1

**問題**:
`app.config.ts`（L37-42）では `NSPrivacyAccessedAPICategoryUserDefaults（CA92.1）` のみ宣言している。

```typescript
// app.config.ts L37-42
NSPrivacyAccessedAPITypes: [
  {
    NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
    NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
  },
],
```

React Native / Expo の依存ライブラリが内部的に以下の Required Reason API を使用する可能性がある。

| API カテゴリ | 可能性 | 用途 |
|------------|--------|------|
| `NSPrivacyAccessedAPICategoryFileTimestamp` | 高 | ファイル操作系ライブラリ |
| `NSPrivacyAccessedAPICategoryDiskSpace` | 中 | キャッシュ管理 |
| `NSPrivacyAccessedAPICategorySystemBootTime` | 中 | タイマー・アニメーション |

**修正方針**:
1. `expo prebuild` を実行し、生成された `ios/app/PrivacyInfo.xcprivacy` の内容を確認する
2. 不足している API カテゴリがあれば `app.config.ts` の `NSPrivacyAccessedAPITypes` に追加する
3. 追加時は Apple の公式 [Required Reason API](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api) ドキュメントから適切な Reason コードを選択する

---

#### 7. 日本語のみ対応（配信地域の未定義）

**ガイドライン**: Guideline 2.3

**問題**:
UI・エラーメッセージ・通知文言がすべて日本語。App Store でグローバル配信する場合、英語圏ユーザーは使用できず、説明文と実際の機能が乖離する可能性がある（2.3違反）。

**現状コード例**:
- `app/patient/[id].tsx` L305: `"患者が見つかりません"`
- `app/preset/[id].tsx` L47: `"プリセットが見つかりません"`
- 全画面の UI ラベルが日本語

**修正方針（二択）**:
1. **配信地域を日本のみに制限する**: App Store Connect で「特定の国と地域」を日本のみに設定（推奨・即時対応可能）
2. **多言語対応を実装する**: `i18n-js` 等を導入し、英語・日本語対応（工数大）

---

### 🔵 LOW（メタデータ・申請前の確認事項）

---

#### 8. スクリーンショットの準備不足

**ガイドライン**: Guideline 2.3

App Store Connect に登録するスクリーンショットの必要サイズ:

| デバイス | サイズ | 必須 |
|---------|-------|------|
| iPhone 6.9インチ (iPhone 16 Pro Max) | 1320 × 2868px | ✅ 必須 |
| iPhone 6.5インチ (iPhone 14 Plus / 15 Plus) | 1284 × 2778px | ✅ 必須 |
| Apple Watch Ultra 2 (49mm) | 410 × 502px | Watch 審査用 |
| Apple Watch Series 10 (46mm) | 396 × 484px | Watch 審査用 |
| Apple Watch Series 4+ (44mm) | 368 × 448px | Watch 審査用 |

実機またはシミュレーターで各サイズのスクリーンショットを事前に準備すること。

---

#### 9. 年齢制限の設定

**ガイドライン**: Guideline 1.3

医療専門家向けツールとして「17+」への設定を推奨。患者の医療情報（投薬量・投与時間）を扱うため、一般ユーザー（特に子ども）への適切なアクセス制限が望ましい。

App Store Connect の「年齢制限」で **17+（成熟した/Suggested Audiences）** を選択する。

---

#### 10. Support URL / Marketing URL の未設定

**ガイドライン**: App Store Connect 申請要件

App Store Connect への申請時に以下の URL 登録が必要（Support URL は**必須**）:

| 項目 | 必須 | 内容 |
|-----|------|------|
| Support URL | **必須** | サポート問い合わせページ（GitHub Issues 等でも可） |
| Marketing URL | 任意 | アプリ紹介ページ |
| Privacy Policy URL | **必須**（医療系） | プライバシーポリシー（#4 参照） |

---

## 申請前チェックリスト

### ビルド設定

- [ ] `eas.json` の production プロファイルで `aps-environment` が `production` に設定されることを確認
- [ ] `expo prebuild` 後に `ios/app/PrivacyInfo.xcprivacy` を確認し、必要な API カテゴリが網羅されているか検証
- [ ] `app.config.ts` の `version`（1.0.0）と `buildNumber`（1）が正しいことを確認
- [ ] `bundleIdentifier`（`com.dripcalculator.app`）が App Store Connect と一致することを確認

### コード修正

- [ ] 医療免責事項を初回起動時に表示する実装を追加
- [ ] `app/patient/[id].tsx` L302-308 のエラー画面に戻るボタンを追加
- [ ] `app/preset/[id].tsx` L44-50 のエラー画面に戻るボタンを追加

### App Store Connect メタデータ

- [ ] プライバシーポリシー URL を登録（医療系アプリに必須）
- [ ] Support URL を登録（必須）
- [ ] 配信地域を「日本のみ」に設定（または多言語対応を実装）
- [ ] 年齢制限を「17+」に設定
- [ ] iPhone アプリのプライバシー情報を申告（データ収集なし・デバイス内のみ）
- [ ] Watch アプリのプライバシー情報を別途申告

### スクリーンショット

- [ ] iPhone 6.9インチ用スクリーンショット（必須）
- [ ] iPhone 6.5インチ用スクリーンショット（必須）
- [ ] Apple Watch 用スクリーンショット（Watch アプリ公開時に必須）

---

## 優先対応ロードマップ

```
Phase 1（リジェクト防止・必須）
├── 医療免責事項の実装（初回起動ダイアログ + 設定画面ページ）
├── エラー画面への戻るボタン追加（2ファイル）
└── aps-environment の本番設定確認

Phase 2（申請要件の充足）
├── プライバシーポリシーページ・URL の準備
├── Support URL の準備
└── 配信地域の設定（日本限定を推奨）

Phase 3（メタデータ整備）
├── スクリーンショットの撮影・登録
├── App Store Connect でのプライバシー申告
│   ├── iPhone アプリ分
│   └── Watch アプリ分（別途）
└── 年齢制限の設定（17+）
```
