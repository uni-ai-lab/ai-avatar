import type { Context } from "hono";
import type { Bindings } from "../types";
import { generateResponse } from "../services/llmServices/chatAgent";
import { generateSpeech } from "../services/voicevox/generateSpeech";

/**
 * Controller for voice chat endpoint
 * Handles the business logic for processing voice chat requests
 */
export async function handleVoiceChat(c: Context<{ Bindings: Bindings }>) {
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
}