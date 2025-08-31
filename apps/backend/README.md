# Zundamon AI Avatar Backend

Hono フレームワークを使用した Cloudflare Workers 上の API サーバー。

## 開発

```bash
bun install
bun run dev
```


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
