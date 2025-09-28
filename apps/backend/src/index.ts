import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import voiceChat from "./api/voiceChat";
import voiceChatAudio from "./api/voiceChatAudio";

type Bindings = {
  OPENAI_API_KEY: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.use(
  "/*",
  cors({
    origin: (origin) => {
      // originがundefined（same-origin）または localhost を含む場合は許可
      if (!origin || origin.includes("localhost")) {
        return origin;
      }
      return null;
    },
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Content-Type"],
  }),
);

// TODO: UI 上で API の名前が Default になっているのを修正する
app
  .route("/api/zundamon/voice-chat", voiceChat)
  .doc("/specification", {
    openapi: "3.0.0",
    info: {
      title: "API 仕様書",
      version: "0.1.0",
    },
  })
  .get(
    "/doc",
    swaggerUI({
      title: "Voice Chat API",
      url: "/specification",
    }),
  );

app.route("/api/zundamon/voice-chat/audio", voiceChatAudio);

export default app;
