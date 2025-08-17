# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## アーキテクチャ

ずんだもんキャラクターを使った AI アバターチャットアプリケーションのモノレポです：

- **フロントエンド**: `apps/frontend/` の React + Vite アプリケーション。音声チャットインターフェースを提供
- **バックエンド**: `apps/backend/` の Hono API サーバー。Cloudflare Workers にデプロイされ、チャットリクエストを処理

フロントエンドは `http://localhost:8787/api/zundamon/voice-chat` への REST API 呼び出しでバックエンドと通信します。現在はモックレスポンスを使用していますが、将来の AI 統合に向けた構造になっています。

## 依存関係管理

このプロジェクトは Bun ワークスペースを使用したモノレポです。

### パッケージ追加
- **フロントエンド**: `cd apps/frontend` → `bun add <package-name>`
- **バックエンド**: `cd apps/backend` → `bun add <package-name>`
- **共通依存関係**: `bun add <package-name>`

### インストール
- `bun install`

## 開発コマンド

### ルートレベル（ワークスペース管理）
- `bun run lint` - 全アプリで ESLint を実行
- `bun run lint:fix` - ESLint エラーを自動修正
- `bun run format` - Prettier でコードをフォーマット

### フロントエンド（`apps/frontend/`）
- `bun run dev` - 開発サーバー起動 (http://localhost:5173)
- `bun run build` - 本番用ビルド（TypeScript コンパイル含む）
- `bun run preview` - 本番ビルドをプレビュー

### バックエンド（`apps/backend/`）
- `bun run dev` - Cloudflare Workers 開発サーバー起動 (http://localhost:8787)
- `bun run deploy` - Cloudflare Workers にデプロイ
- `bun run cf-typegen` - Cloudflare バインディングの型を生成

## コーディング規約

### ESLint ルール
- JSX プロパティはアルファベット順にソート（`react/jsx-sort-props`）
- import 文の順序: builtin → external → internal → parent → sibling
- React と React DOM の import を最初に
- 未使用変数はアンダースコア接頭辞必須
- TypeScript strict ルール有効

### ファイル構造
- フロントエンドコンポーネントは CSS Modules（`.module.css`）を使用
- 機能は `src/features/` でコンポーネントと共配置
- ページは `src/pages/` に配置
- バックエンドは Hono フレームワークを使用、ローカル開発用 CORS 設定済み

## API エンドポイント

- `POST /api/zundamon/voice-chat` - ずんだもんにメッセージ送信、JSON レスポンスを返却

## テスト戦略

@docs/testing-strategy.md