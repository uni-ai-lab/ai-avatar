import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  voiceChatAudioRequestSchema,
  voiceChatAudioResponseSchema,
} from "../schemas/voiceChatAudio";
import { generateResponse } from "../services/llmServices/chatAgent";
import { generateSpeech } from "../services/voicevox/generateSpeech";
import { transcribeAudio } from "../services/whisper/transcribeAudio";

type Bindings = {
  OPENAI_API_KEY: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

const route = createRoute({
  path: "/",
  method: "post",
  description: "Voice Chat with Zundamon by Audio",
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: voiceChatAudioRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "ok",
      content: {
        "application/json": {
          schema: voiceChatAudioResponseSchema,
        },
      },
    },
    400: { description: "Bad Request" },
    500: { description: "Internal Server Error" },
  },
});

app.openapi(route, async (c) => {
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
    const speechText = await generateResponse(message, c.env.OPENAI_API_KEY);

    // 音声合成（VoiceVoxが利用できない場合はスキップ）
    let audioBase64: string | null = null;
    try {
      audioBase64 = await generateSpeech(speechText, 1);
    } catch (voiceError) {
      console.warn(
        "VoiceVox unavailable, skipping speech synthesis:",
        voiceError,
      );
    }

    return c.json({
      userMessage: message,
      detectedLanguage: language,
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
