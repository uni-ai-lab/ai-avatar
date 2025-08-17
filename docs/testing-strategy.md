# テスト戦略

## 技術スタック選定

### フロントエンド
- **ユニットテスト**: Vitest（カスタムフック、ユーティリティ関数）
- **統合テスト**: Vitest + React Testing Library（コンポーネント、ユーザー操作）
- **APIインターセプト**: MSW（HTTP リクエストの横取り・模擬レスポンス）
- **UIコンポーネントエクスプローラー**: Storybook（コンポーネント単体表示・検証）
- **ビジュアルリグレッションテスト**: Storybook + storycap + reg-suit

### バックエンド
- **ユニットテスト**: Vitest（サービス層、ユーティリティ関数）
- **統合テスト**: Vitest + @cloudflare/vitest-pool-workers（app.request でエンドポイント全体）

### その他
- **E2Eテスト**: Playwright（ブラウザ自動化、ユーザーフロー検証）

### 参考リンク
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW](https://mswjs.io/)
- [Testing - Hono](https://hono.dev/docs/guides/testing)
- [【Storybook】 Storycap と reg-suit を使って VRT（Visual Regression Testing）をやってみた](https://dev.classmethod.jp/articles/visual-regression-testing-using-storycap-and-reg-suit/)

## テスト配置ルール

### 基本原則
Co-location - テストは対象ファイルと同じ場所

### ファイル命名
- テスト: `*.test.ts` または `*.test.tsx`
- Storybook: `*.stories.tsx`

### ディレクトリ構造例
```
apps/frontend/src/
├── features/voice-chat/
│   ├── components/VoiceChat/
│   │   ├── index.tsx
│   │   ├── index.test.tsx          # コンポーネントテスト
│   │   └── index.stories.tsx       # Storybook ストーリー
│   ├── hooks/
│   │   ├── useAudioPlayer.ts
│   │   ├── useAudioPlayer.test.ts  # フックテスト
│   │   ├── useMessages.ts
│   │   └── useMessages.test.ts
│   └── api/
│       ├── sendVoiceChat.ts
│       └── sendVoiceChat.test.ts   # API 関数テスト
├── pages/VoiceChatPage/
│   ├── index.tsx
│   └── index.test.tsx              # ページテスト
└── test/（共通テストリソース）
    └── setup.ts                   # テスト設定

apps/backend/src/
├── services/voicevox/
│   ├── client.ts
│   ├── client.test.ts             # サービステスト
│   ├── generateSpeech.ts
│   └── generateSpeech.test.ts
├── controllers/
│   ├── voiceChat.ts
│   └── voiceChat.test.ts          # コントローラーテスト
└── utils/
    ├── helper.ts
    └── helper.test.ts             # ユーティリティテスト

apps/e2e/                          # E2Eテスト
```

## テスト戦略

### フロントエンドテスト戦略（Testing Trophy）
- **統合テスト重視**: Kent C. Dodds の Testing Trophy に基づく
- **テスト配分**: 統合（多）→ ユニット（中）→ E2E（少）
- **重点領域**: コンポーネント、ユーザー操作、DOM インタラクション
- 参考: [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)

### バックエンドテスト戦略（Test Pyramid）
- **ユニットテスト重視**: Mike Cohn のテストピラミッドに基づく
- **テスト配分**: ユニット（多）→ 統合（中）→ E2E（少）
- **重点領域**: ビジネスロジック
- 参考: [The Test Pyramid - Martin Fowler](https://martinfowler.com/bliki/TestPyramid.html)

### テスト記述
- AAAパターン（Arrange-Act-Assert）

## カバレッジ
カバレッジレポートを積極的に活用し、テスト漏れの発見に役立てる。
ただし目標値は設定しない（グッドハートの法則を考慮）。

Vitest の v8 プロバイダーを使用（[Coverage - Vitest](https://vitest.dev/guide/coverage.html)）

## CI/CD 方針

### 基本方針
- **push 時**: ユニット・統合テストを実行
- **PR 時**: E2E テストを実行

詳細は実装時に決定