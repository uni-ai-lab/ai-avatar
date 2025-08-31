import { Hono } from "hono";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { generateResponse } from "./services/llmServices/chatAgent";
import { generateSpeech } from "./services/voicevox/generateSpeech";

type Bindings = {
  OPENAI_API_KEY: string;
};

// Original Hono app for existing API
const app = new Hono<{ Bindings: Bindings }>();
// OpenAPI app for documentation  
const openApiApp = new OpenAPIHono<{ Bindings: Bindings }>();

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

// Original Voice Chat API - UNCHANGED from pre-PR state
app.post("/api/zundamon/voice-chat", async (c) => {
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
});

// Voice Chat Route Schema for OpenAPI documentation
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

// Add the route schema to OpenAPI app for documentation only
openApiApp.openapi(voiceChatRoute, async (c) => {
  // This handler won't actually be called since the original app handles the route
  return c.json({ error: "This should not be reached" }, 500);
});

// OpenAPI spec endpoint
app.get("/doc", (c) => {
  const spec = {
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
    paths: {
      "/api/zundamon/voice-chat": {
        post: {
          tags: ["Voice Chat"],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      minLength: 1,
                      description: "User message to Zundamon",
                    },
                  },
                  required: ["message"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Successful voice chat response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      userMessage: {
                        type: "string",
                        description: "Original user message",
                      },
                      zundamonResponse: {
                        type: "string",
                        description: "Zundamon response text",
                      },
                      audioBase64: {
                        type: "string",
                        description: "Base64 encoded audio",
                      },
                      timestamp: {
                        type: "string",
                        description: "Response timestamp",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Bad request - invalid input",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  return c.json(spec);
});

// Swagger UI
app.get("/ui", swaggerUI({ url: "/doc" }));

export default app;