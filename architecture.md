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
├── app/                          # Expo Router 画面定義
│   ├── (tabs)/                   # タブナビゲーション
│   ├── patient/[id].tsx          # 患者詳細画面
│   ├── preset/                   # プリセット関連画面
│   ├── _layout.tsx               # ルートレイアウト
│   └── ...
├── src/
│   ├── components/               # 再利用可能なUIコンポーネント（フラット構成）
│   ├── contexts/                 # React Context（状態管理）
│   ├── features/                 # 機能単位のモジュール
│   │   └── <feature>/
│   │       ├── hooks/            # 機能固有のカスタムフック
│   │       ├── logic.ts          # ビジネスロジック（純粋関数）
│   │       └── logic.test.ts     # ロジックのテスト
│   ├── hooks/                    # アプリ共通のカスタムフック
│   ├── lib/                      # ユーティリティ・ヘルパー
│   │   ├── storage.ts            # AsyncStorageラッパー
│   │   ├── notification.ts       # 通知ユーティリティ
│   │   └── logger.ts             # ログユーティリティ
│   ├── types/                    # 共通型定義
│   │   ├── patient.ts            # 患者データ型
│   │   ├── infusion.ts           # 点滴・計算関連型
│   │   ├── preset.ts             # プリセット型
│   │   ├── context.ts            # Context用型
│   │   ├── hooks.ts              # フック用型
│   │   └── ...
│   └── constants/                # 定数定義
├── modules/
│   └── watch-connectivity/       # Expo Native Module（iPhone⇄Watch通信）
│       ├── index.ts              # JS API
│       ├── src/                  # TypeScript型定義
│       └── ios/                  # Swift実装
├── targets/
│   └── watch/                    # watchOSターゲット (@bacons/apple-targets)
│       ├── src/
│       │   ├── Models/           # データモデル (Swift)
│       │   ├── Views/            # SwiftUI画面
│       │   ├── ViewModels/       # 状態管理（WatchConnectivityManager等）
│       │   └── Utilities/        # ヘルパー（HapticManager等）
│       └── Info.plist
├── ios/                          # expo prebuild で生成（git管理外）
├── app.config.ts                 # Expo設定
├── tsconfig.json
├── package.json
├── CLAUDE.md                     # コーディング規約・審査ルール
└── architecture.md               # 本ドキュメント
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
│    └── Components/          │  再利用可能なサブビュー
├─────────────────────────────┤
│  ViewModels/                │  画面の状態管理・WatchConnectivity通信
├─────────────────────────────┤
│  Models/                    │  データモデル（TypeScript側と手動同期）
├─────────────────────────────┤
│  Utilities/                 │  ヘルパー（HapticManager等）
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
iPhone                              Apple Watch
──────                              ───────────
modules/watch-connectivity/         ViewModels/
  (Expo Native Module)              WatchConnectivityManager.swift
  │                                    │
  │  WatchConnectivity                 │
  │  (sendMessage /                    │
  │   transferUserInfo /               │
  │   updateApplicationContext)        │
  │◄──────────────────────────────────►│
  │                                    │
AsyncStorage                        UserDefaults
(ローカル保存)                       (ローカルキャッシュ)
```

**同期方針**:

- `updateApplicationContext`: 最新状態の共有（アプリ起動時に最新を取得）
- `sendMessage`: リアルタイム通信（両方がアクティブな場合）
- `transferUserInfo`: キュー方式（確実に届けたいデータ）

### 共有スキーマの管理

```
src/types/ (TypeScript)           targets/watch/src/Models/ (Swift)
  patient.ts                        WatchPatient.swift
  infusion.ts                       InfusionCalculator.swift
        │                                  │
        └──── 手動同期（型の対応を維持）────┘
```

型定義はTypeScript側（`src/types/`）とSwift側（`targets/watch/src/Models/`）にそれぞれ配置されている。
一元管理（SSOT）の仕組みは未導入のため、スキーマ変更時は両方のファイルを手動で同時に更新する。

## ストレージ設計

| プラットフォーム | 技術              | 用途                    |
| ---------------- | ----------------- | ----------------------- |
| iPhone           | AsyncStorage      | アプリデータの永続化    |
| Apple Watch      | UserDefaults      | Watchローカルキャッシュ |
| 共通             | WatchConnectivity | デバイス間データ同期    |

- 外部サーバー・クラウドDBは使用しない
- すべてのデータはデバイスローカルに保存する

## ビルド・デプロイフロー

```
1. Expo開発
   npm start → Expo Go / Development Build で開発

2. ネイティブプロジェクト生成
   expo prebuild → ios/ ディレクトリ生成
   ※ @bacons/apple-targets により targets/watch/ が自動統合される

3. ビルド・提出
   EAS Build または Xcode Archive → App Store Connect
```
