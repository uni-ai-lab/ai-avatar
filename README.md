# ai-avatar
AIアバターとボイスチャットするためのアプリです。

## 主な使用技術/ツール
* [React](https://ja.react.dev/)
* [Vite](https://ja.vitejs.dev/)
* [TypeScript](https://www.typescriptlang.org/)
* [Hono](https://hono.dev/)

## 環境構築
> [!NOTE]
Node.js (最新の LTS 版を推奨) と Bun がインストールされていることを確認してください。

### Bun のインストール
```bash
# Linux & macOS
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```
参考: https://bun.sh/

### バージョン確認
```bash
node -v
bun -v
```

### 1. リポジトリのクローン
```bash
git clone <repository-url>
```

### 2. 依存関係のインストール
```bash
cd ai-avatar
bun install
```

## 起動

### フロントエンド開発サーバー
```bash
cd apps/frontend
bun run dev
```
フロントエンドは http://localhost:5173 で起動します。

### バックエンド開発サーバー
```bash
cd apps/backend
bun run dev
```
バックエンドは http://localhost:8787 で起動します。

## 開発コマンド

このプロジェクトは Bun ワークスペースを使用したモノレポです。

### ワークスペース管理（ルートディレクトリ）
- `bun run lint` - 全アプリで ESLint を実行
- `bun run lint:fix` - ESLint エラーを自動修正
- `bun run format` - Prettier でコードをフォーマット
- `bun add <package-name>` - 共通依存関係を追加

### フロントエンド（`apps/frontend/`）
- `bun run dev` - 開発サーバー起動 (http://localhost:5173)
- `bun run build` - 本番用ビルド（TypeScript コンパイル含む）
- `bun run preview` - 本番ビルドをプレビュー
- `bun add <package-name>` - フロントエンド専用パッケージを追加

### バックエンド（`apps/backend/`）
- `bun run dev` - Cloudflare Workers 開発サーバー起動 (http://localhost:8787)
- `bun add <package-name>` - バックエンド専用パッケージを追加

## ディレクトリ構成

### バックエンド
#### プロジェクト直下
```bash
ai-avatar/apps/backend
|
├── src
|
├── wrangler.jsonc # Cloudflare Workers 設定
|
├── package.json
|
└── tsconfig.json
```

#### src
```bash
src
|
├── config # 各種設定ファイル
|
├── controllers # リクエスト/レスポンス処理
|
├── middleware # リクエスト前後の横断的処理
|
├── services # ビジネスロジック
|
├── types # 型定義
|
├── utils # ユーティリティ関数
|
└── index.ts # アプリケーションのエントリーポイント
```

### フロントエンド
#### プロジェクト直下
基本的に Vite で生成されたデフォルトの構成に従っています。

参考: [Vite の GitHub リポジトリの template-react-ts](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)

```bash
ai-avatar/apps/frontend
|
├── public
|
├── src
|
├── index.html
|
├── package.json
|
├── tsconfig.app.json
|
├── tsconfig.json
|
├── tsconfig.node.json
|
└── vite.config.ts
```

#### src
```bash
src
|
├── assets # 画像やフォントなどの静的ファイル
|
├── components # 複数の feature で使用する汎用コンポーネント
|
├── config # 各種設定ファイル
|
├── features # 特定の feature で使用するファイル
|
├── hooks # アプリケーション全体で使用するカスタムフック
|
├── lib # 外部ライブラリの設定や自作のクラスなど
|
├── mocks # MSW でモックするためのファイル
|
├── pages # 特定のページに対応するコンポーネント (URLと1対1で対応)
|
├── styles # グローバルに適用するスタイル
|
├── types # アプリケーション全体で使用する型
|
├── test # テスト関連のファイル
|
└── utils # 複数の汎用コンポーネントや feature コンポーネントで使用するユーティリティ関数
```

#### features
```bash
feature
|
├── components # 特定の feature で使用するコンポーネント
|
├── hooks # 特定の feature に特化したカスタムフック
|
├── types # 特定の feature で使用する型
|
└── utils # 特定の feature のみで使用するユーティリティ関数
```

#### src/components or src/features/components
```bash
components
|
├── ChildComponent(フォルダ) # 孫以降のコンポーネントが存在する、子コンポーネント
|
├── index.tsx  # フォルダのルートコンポーネント
|
├── Feature.module.css # フォルダのルートコンポーネントのスタイル
|
├── Feature.test.tsx # フォルダのルートコンポーネントのテスト
|
├── ChildComponent.tsx # 孫以降のコンポーネントが存在しない子コンポーネント
|
├── ChildComponent.module.css # 孫以降のコンポーネントが存在しない子コンポーネントのスタイル
|
└── ChildComponent.test.tsx # 孫以降のコンポーネントが存在しない子コンポーネントのテスト
```
