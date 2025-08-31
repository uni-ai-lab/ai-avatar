# Zundamon AI Avatar Backend

Hono フレームワークを使用した Cloudflare Workers 上の API サーバー。

## 開発

```bash
bun install
bun run dev
```

## Swagger UI

開発サーバー起動後、以下の URL でAPI を確認・テストできます：

- **Swagger UI**: http://localhost:8787/ui - インタラクティブなAPI テスト画面
- **OpenAPI 仕様**: http://localhost:8787/doc - JSON 形式の API 仕様

## デプロイ

```bash
bun run deploy
```

## 型生成

[Cloudflare Workers の設定に基づく型生成](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```bash
bun run cf-typegen
```

## API エンドポイント

### POST /api/zundamon/voice-chat

ずんだもんとのボイスチャット API。

**リクエスト:**
```json
{
  "message": "こんにちは"
}
```

**レスポンス:**
```json
{
  "userMessage": "こんにちは",
  "zundamonResponse": "こんにちはなのだ！",
  "audioBase64": "base64_encoded_audio_data",
  "timestamp": "2025-08-24T13:45:00.000Z"
}
```
