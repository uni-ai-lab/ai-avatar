import { Hono } from "hono";
import { cors } from "hono/cors";

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

  // ランダムな返答を選択
  const randomIndex = Math.floor(Math.random() * ZUNDAMON_RESPONSES.length);
  const response = ZUNDAMON_RESPONSES[randomIndex];

  return c.json({
    userMessage: message,
    zundamonResponse: response,
    timestamp: new Date().toISOString(),
  });
});

export default app;
