import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { generateResponse } from "./services/llmServices/chatAgent";
import { generateSpeech } from "./services/voicevox/generateSpeech";
import { transcribeAudio } from "./services/whisper/transcribeAudio";

type Bindings = {
  OPENAI_API_KEY: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.use(
  "/*",
  cors({
    origin: (origin) => {
      // originがundefined（same-origin）または localhost を含む場合は許可
      if (!origin || origin.includes('localhost')) {
        return origin;
      }
      return null;
    },
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Content-Type"],
  }),
);

const route = createRoute({
  path: "/api/zundamon/voice-chat",
  method: "post",
  description: "Voice Chat with Zundamon",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({
              example: "こんにちは",
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "ok",
      content: {
        "application/json": {
          schema: z.object({
            userMessage: z.string().openapi({
              example: "こんにちは",
            }),
            zundamonResponse: z.string().openapi({
              example: "こんにちは！今日はどのようにお手伝いできますか？",
            }),
            audioBase64: z.string().openapi({
              example: "base64-encoded-audio",
            }),
            timestamp: z.string().openapi({
              example: "2023-03-15T12:00:00Z",
            }),
          }),
        },
      },
    },
    400: { description: "Bad Request" },
    500: { description: "Internal Server Error" },
  },
});

// Voice Chat API
// TODO: UI 上で API の名前が Default になっているのを修正する
app
  .openapi(route, async (c) => {
    const body = await c.req.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return c.json({ error: "Message is required" }, 400);
    }

    try {
      // LLMによる回答生成
      const speechText = await generateResponse(message, c.env.OPENAI_API_KEY);

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
      return c.json({ error: "Internal server error" }, 500);
    }
  })
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

// Voice Chat API - audio input with Whisper transcription
app.post("/api/zundamon/voice-chat/audio", async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return c.json({ error: "Audio file is required" }, 400);
    }

    // Whisperで音声を文字起こし
    const transcriptionResult = await transcribeAudio(audioFile, c.env);
    const { text: message, language } = transcriptionResult;

    if (!message) {
      return c.json({ error: "Could not transcribe audio" }, 400);
    }

    // LLMによる回答生成
    const speechText = await generateResponse(message);

    // 音声合成（VoiceVoxが利用できない場合はスキップ）
    let audioBase64: string | null = null;
    try {
      audioBase64 = await generateSpeech(speechText, 1);
    } catch (voiceError) {
      console.warn("VoiceVox unavailable, skipping speech synthesis:", voiceError);
    }

    return c.json({
      userMessage: message,
      detectedLanguage: language,
      zundamonResponse: speechText,
      audioBase64: audioBase64,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
