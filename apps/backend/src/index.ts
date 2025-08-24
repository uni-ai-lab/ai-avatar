import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { generateResponse } from "./services/llmServices/chatAgent";
import { generateSpeech } from "./services/voicevox/generateSpeech";

type Bindings = {
  OPENAI_API_KEY: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

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

// Voice Chat Route Schema
const voiceChatRoute = createRoute({
  method: "post",
  path: "/api/zundamon/voice-chat",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().min(1).describe("User message to Zundamon"),
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
            zundamonResponse: z.string().describe("Zundamon response text"),
            audioBase64: z.string().describe("Base64 encoded audio"),
            timestamp: z.string().describe("Response timestamp"),
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
});

// Voice Chat API Implementation
app.openapi(voiceChatRoute, async (c) => {
  const { message } = c.req.valid("json");

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

// OpenAPI spec endpoint
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Zundamon AI Avatar API",
    description: "API for Zundamon AI Avatar chat application",
  },
  servers: [
    {
      url: "http://localhost:8787",
      description: "Development server",
    },
  ],
});

// Swagger UI
app.get("/ui", swaggerUI({ url: "/doc" }));

export default app;
