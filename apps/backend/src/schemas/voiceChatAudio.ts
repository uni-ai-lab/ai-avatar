import { z } from "@hono/zod-openapi";

export const voiceChatAudioRequestSchema = z.object({
  // https://github.com/colinhacks/zod/issues/387#issuecomment-1352448672
  audio: z.custom<File>().openapi({
    type: "string",
    format: "binary",
    description: "Audio file to transcribe (wav, mp3, m4a, etc.)",
  }),
});

export const voiceChatAudioResponseSchema = z.object({
  userMessage: z.string().openapi({
    example: "こんにちは",
  }),
  detectedLanguage: z.string().openapi({
    example: "japanese",
  }),
  zundamonResponse: z.string().openapi({
    example: "こんにちは！今日はどのようにお手伝いできますか？",
  }),
  audioBase64: z.string().nullable().openapi({
    example: "base64-encoded-audio",
  }),
  timestamp: z.string().openapi({
    example: "2023-03-15T12:00:00Z",
  }),
});
