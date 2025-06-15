import { Hono } from "hono";
import { cors } from "hono/cors";
import { VoiceVoxError } from "./services/voicevox/errors";
import { generateSpeech } from "./services/voicevox/generateSpeech";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173"],
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Content-Type"],
  }),
);

const ZUNDAMON_RESPONSES = [
  "そうなのだ！とても面白いのだ！",
  "なるほどなのだ〜、勉強になるのだ！",
  "ずんだもんも同じことを思っていたのだ！",
  "それは素晴らしいアイデアなのだ！",
  "もっと詳しく教えてほしいのだ〜",
  "ずんだもんはそれが大好きなのだ！",
  "とても興味深い話なのだ！",
  "一緒に考えてみるのだ〜",
  "それはとても大切なことなのだ！",
  "ずんだもんも応援するのだ〜！",
];

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Voice Chat API (現在はテキストのモック)
app.post("/api/zundamon/voice-chat", async (c) => {
  const body = await c.req.json();
  const { message } = body;

  if (!message || typeof message !== "string") {
    return c.json({ error: "Message is required" }, 400);
  }

  try {
    // ランダムな返答を選択
    const randomIndex = Math.floor(Math.random() * ZUNDAMON_RESPONSES.length);
    const speechText = ZUNDAMON_RESPONSES[randomIndex];

    // 音声合成
    const audioBase64 = await generateSpeech(speechText, 1);

    return c.json({
      userMessage: message,
      zundamonResponse: speechText,
      audioBase64: audioBase64,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: "Internal server error: " + errorMessage }, 500);
  }
});

export default app;
