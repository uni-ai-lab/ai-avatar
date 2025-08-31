import { z } from "zod";

/**
 * Request schema for voice chat endpoint
 */
export const voiceChatRequestSchema = z.object({
  message: z.string().min(1).describe("User message to send to AI avatar"),
});

/**
 * Response schema for successful voice chat
 */
export const voiceChatResponseSchema = z.object({
  userMessage: z.string().describe("Original user message"),
  zundamonResponse: z.string().describe("AI avatar response text"),
  audioBase64: z.string().describe("Base64 encoded audio of the response"),
  timestamp: z.string().describe("ISO timestamp"),
});

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  error: z.string(),
});

/**
 * OpenAPI route definition for voice chat endpoint
 */
export const voiceChatRouteDefinition = {
  method: "post",
  path: "/api/zundamon/voice-chat",
  request: {
    body: {
      content: {
        "application/json": {
          schema: voiceChatRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: voiceChatResponseSchema,
        },
      },
      description: "Successful voice chat response",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
  tags: ["Voice Chat"],
  summary: "Send message to AI avatar and get voice response",
} as const;