import { z } from "@hono/zod-openapi";

export const voiceChatRequestSchema = z.object({
  message: z.string().openapi({
    example: "こんにちは",
  }),
});

export const voiceChatResponseSchema = z.object({
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
});
