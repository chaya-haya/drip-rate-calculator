# Architecture

本ドキュメントはプロジェクトの構造・レイヤー設計・データフローを記述する。
コーディング規約・審査ルール等は [CLAUDE.md](./CLAUDE.md) を参照。

## システム全体像

```
┌─────────────────────────────────────────────────┐
│                   App Store                      │
│                                                  │
│  ┌──────────────────┐    ┌───────────────────┐  │
│  │   iPhone App     │    │  Apple Watch App  │  │
│  │  (Expo / RN)     │◄──►│  (Swift / SwiftUI)│  │
│  │  TypeScript      │    │  watchOS          │  │
│  └──────┬───────────┘    └──────┬────────────┘  │
│         │                       │                │
│         │   WatchConnectivity   │                │
│         └───────────┬───────────┘                │
│                     │                            │
│         ┌───────────▼───────────┐                │
│         │   ローカルストレージ    │                │
│         │  (AsyncStorage / UD)  │                │
│         └───────────────────────┘                │
└─────────────────────────────────────────────────┘

※ 外部サーバー通信なし（オフラインファースト）
```

## ディレクトリ構成

```
pro/
├── app/                      # Expo Router 画面定義
│   ├── (tabs)/               # タブナビゲーション
│   ├── _layout.tsx           # ルートレイアウト
│   └── ...
├── components/               # 再利用可能なUIコンポーネント
│   └── ui/                   # 汎用UIパーツ（ボタン、カード等）
├── features/                 # 機能単位のモジュール
│   └── <feature>/
│       ├── components/       # 機能固有のコンポーネント
│       ├── hooks/            # 機能固有のカスタムフック
│       ├── logic.ts          # ビジネスロジック（純粋関数）
│       └── logic.test.ts     # ロジックのテスト
├── hooks/                    # アプリ共通のカスタムフック
├── lib/                      # ユーティリティ・ヘルパー
│   ├── storage.ts            # AsyncStorageラッパー
│   └── watchSync.ts          # WatchConnectivity連携（RN側）
├── types/                    # 共通型定義
│   └── schema.ts             # iPhone/Watch共有データスキーマ
├── constants/                # 定数定義
├── ios/                      # expo prebuild で生成
│   ├── <AppName>/
│   └── <AppName>Watch/       # watchOSターゲット
│       ├── Models/           # 共有データモデル (Swift)
│       ├── Views/            # SwiftUI画面
│       ├── Services/         # WatchConnectivity等
│       └── Assets.xcassets/
├── shared-schema/            # iPhone/Watch間 共有スキーマ定義
│   └── DataSchema.swift      # Swiftのデータ型定義（types/schema.tsと対応）
├── app.config.ts             # Expo設定
├── tsconfig.json
├── package.json
├── CLAUDE.md                 # コーディング規約・審査ルール
└── architecture.md           # 本ドキュメント
```

## レイヤー構成（iPhone App）

```
┌─────────────────────────────┐
│  画面 (app/)                │  Expo Router による画面遷移
├─────────────────────────────┤
│  コンポーネント              │  UIの組み立て（表示専用）
│  (components/, features/*)  │
├─────────────────────────────┤
│  フック (hooks/)            │  状態管理・副作用の制御
├─────────────────────────────┤
│  ロジック (features/*/logic)│  純粋関数・ビジネスルール（TDD対象）
├─────────────────────────────┤
│  ストレージ / 同期 (lib/)   │  AsyncStorage, WatchConnectivity
└─────────────────────────────┘
```

**依存ルール**: 上位レイヤーは下位を参照できるが、逆方向の参照は禁止。
ロジック層はReactに依存しない純粋なTypeScriptとして実装する。

## レイヤー構成（Apple Watch App）

```
┌─────────────────────────────┐
│  Views/                     │  SwiftUI画面（1画面1機能）
├─────────────────────────────┤
│  ViewModels/ (任意)         │  画面の状態管理
├─────────────────────────────┤
│  Models/                    │  データモデル（shared-schemaと同期）
├─────────────────────────────┤
│  Services/                  │  WatchConnectivity, UserDefaults
└─────────────────────────────┘
```

## データフロー

### iPhone内部

```
ユーザー操作
  → コンポーネント（イベント発火）
    → フック（状態更新 + 副作用実行）
      → ロジック（計算・変換）
      → ストレージ（永続化）
    → コンポーネント（再描画）
```

### iPhone ⇄ Apple Watch 同期

```
iPhone                          Apple Watch
──────                          ───────────
lib/watchSync.ts                Services/WatchService.swift
  │                                │
  │  WatchConnectivity             │
  │  (sendMessage /                │
  │   transferUserInfo /           │
  │   updateApplicationContext)    │
  │◄──────────────────────────────►│
  │                                │
AsyncStorage                    UserDefaults
(ローカル保存)                   (ローカルキャッシュ)
```

**同期方針**:
- `updateApplicationContext`: 最新状態の共有（アプリ起動時に最新を取得）
- `sendMessage`: リアルタイム通信（両方がアクティブな場合）
- `transferUserInfo`: キュー方式（確実に届けたいデータ）

### 共有スキーマの管理

```
types/schema.ts (TypeScript)  ←── 信頼できる唯一の情報源 (SSOT)
        │
        │  手動同期（型の対応を維持）
        ▼
shared-schema/DataSchema.swift (Swift)
```

型の不整合を防ぐため、スキーマ変更時は両ファイルを必ず同時に更新する。

## ストレージ設計

| プラットフォーム | 技術 | 用途 |
|---|---|---|
| iPhone | AsyncStorage | アプリデータの永続化 |
| Apple Watch | UserDefaults | Watchローカルキャッシュ |
| 共通 | WatchConnectivity | デバイス間データ同期 |

- 外部サーバー・クラウドDBは使用しない
- すべてのデータはデバイスローカルに保存する

## ビルド・デプロイフロー

```
1. Expo開発
   npm start → Expo Go / Development Build で開発

2. ネイティブプロジェクト生成
   expo prebuild → ios/ ディレクトリ生成

3. watchOSターゲット追加
   Xcodeで ios/<AppName>Watch/ ターゲットを追加・実装

4. ビルド・提出
   EAS Build または Xcode Archive → App Store Connect
```
