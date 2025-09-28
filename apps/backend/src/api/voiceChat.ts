import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  voiceChatRequestSchema,
  voiceChatResponseSchema,
} from "../schemas/voiceChat";
import { generateResponse } from "../services/llmServices/chatAgent";
import { generateSpeech } from "../services/voicevox/generateSpeech";

type Bindings = {
  OPENAI_API_KEY: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

const route = createRoute({
  path: "/",
  method: "post",
  description: "Voice Chat with Zundamon",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: voiceChatRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "ok",
      content: {
        "application/json": {
          schema: voiceChatResponseSchema,
        },
      },
    },
    400: { description: "Bad Request" },
    500: { description: "Internal Server Error" },
  },
});

app.openapi(route, async (c) => {
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
});

export default app;
