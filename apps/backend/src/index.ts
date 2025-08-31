import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { z } from "zod";
import { generateResponse } from "./services/llmServices/chatAgent";
import { generateSpeech } from "./services/voicevox/generateSpeech";

type Bindings = {
  OPENAI_API_KEY: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "AI Avatar API",
  },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173"],
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Voice Chat API with OpenAPI schema
const voiceChatRoute = app.openapi(
  {
    method: "post",
    path: "/api/zundamon/voice-chat",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().min(1).describe("User message to send to AI avatar"),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              userMessage: z.string().describe("Original user message"),
              zundamonResponse: z.string().describe("AI avatar response text"),
              audioBase64: z.string().describe("Base64 encoded audio of the response"),
              timestamp: z.string().describe("ISO timestamp"),
            }),
          },
        },
        description: "Successful voice chat response",
      },
      400: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Bad request - invalid input",
      },
      500: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Internal server error",
      },
    },
    tags: ["Voice Chat"],
    summary: "Send message to AI avatar and get voice response",
  },
  async (c) => {
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

export default app;
