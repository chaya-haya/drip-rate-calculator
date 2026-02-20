# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 汎用ルール（TDD・タスク管理・プランモード・Discord通知・コーディング原則・命名規則）は `~/.claude/CLAUDE.md` を参照。

## プラットフォーム

- **対象**: iOS (iOS 16+)
- **フレームワーク**: Expo (React Native) ※iOSアプリ本体
- **Apple Watch**: Swift (SwiftUI + WatchKit) ※watchOSはネイティブ実装が必須
- **配信**: App Store（審査通過が必須）

## 言語・ツールチェーン

- **言語**: TypeScript (strict: true)
- **パッケージマネージャー**: npm
- **リンター / フォーマッター**: ESLint + Prettier
- **テスト**: Jest

## App Store審査対応ルール

### プライバシー (Apple Review Guideline 5.1)

- ユーザーデータはローカル保存のみ。外部サーバーへの送信を行わない
- トラッキングSDKは使用しない（ATT対応不要）
- `NSPrivacyAccessedAPITypes`をInfo.plistに正しく宣言する（Required Reason API対応）
- カメラ・位置情報・通知などのシステム権限を使う場合、`Info.plist`の`NS***UsageDescription`に利用目的を日本語で明記する

### UIとユーザー体験 (Guideline 4.0)

- Human Interface Guidelines (HIG) に準拠したUIを実装する
- アプリの主要機能はWebViewへの丸投げではなく、ネイティブUIで実装する
- 最低限の機能を持つこと（単なるWebサイトのラッパーはリジェクト対象）
- ローディング状態・エラー状態・空状態を必ずハンドリングする

### パフォーマンスと安定性 (Guideline 2.1)

- クラッシュやフリーズが発生しない品質を保つ
- beta版・テスト用の機能やUIをリリースビルドに含めない
- `console.log`や開発用デバッグコードはリリース前に除去する

### コンテンツとメタデータ (Guideline 2.3 / 4.3)

- アプリの説明・スクリーンショットと実際の機能が一致すること
- 未実装のプレースホルダー画面やダミーコンテンツを残さない

### アプリ内課金 (Guideline 3.1)

- デジタルコンテンツの購入はAppleのIn-App Purchase APIを使用すること（外部決済への誘導は禁止）
- 課金を実装する場合、リストア機能を必ず提供する

### コード品質（審査でのリジェクト防止）

- 非公開API（プライベートAPI）を使用しない
- Expoのmanaged workflowで対応できないネイティブモジュールは`expo-dev-client`経由で安全に導入する
- `app.json` / `app.config.ts`の`bundleIdentifier`、`version`、`buildNumber`を正しく管理する

## Apple Watch (watchOS) 開発ルール

### アーキテクチャ

- watchOSアプリは**Swift (SwiftUI)** で実装する（React Native/Expoはwatchos非対応）
- Expo側はprebuild (`expo prebuild`) してXcodeプロジェクトを生成し、そこにwatchOSターゲットを追加する
- iPhone ⇄ Watch間のデータ同期は **WatchConnectivity** フレームワークを使用する
- Watch側でも単独動作できるよう、ローカルにデータをキャッシュする

### 共有ロジック

- iPhone/Watch間で共有するデータモデルや定数は、共通のSwift Packageまたは共有フォルダにまとめる
- 同期するデータの型定義はTypeScript側とSwift側で齟齬が生じないよう、スキーマを一元管理する

### watchOS固有のUI制約

- 画面サイズが極めて小さいため、1画面1機能を徹底する
- `NavigationStack`ベースのシンプルな画面遷移にする
- テキスト入力は極力避け、タップ・スワイプ・Digital Crownによる操作を前提に設計する
- コンプリケーション対応が必要な場合は`WidgetKit`で実装する

### watchOS審査追加要件 (Guideline 10.0)

- Watch単独で意味のある機能を提供すること（iPhoneアプリへの単なるリモコンはリジェクト対象）
- watchOS向けのスクリーンショットを別途用意する必要がある
- Watch用のプライバシー情報もApp Store Connectで個別に申告する

### Swift コーディング規則

- Swiftコードでも本プロジェクトの原則（不変性、副作用の分離、宣言的記述）を踏襲する
- `let`を優先し、`var`は必要最小限に留める
- コメントは日本語で記述する（TypeScript側と統一）
- 命名はSwift標準のAPI Design Guidelines（camelCase、PascalCase）に従う
