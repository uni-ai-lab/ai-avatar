import { transcribeAudio as whisperTranscribeAudio, WhisperTranscriptionResult } from "./client";

export async function transcribeAudio(
  audioFile: File,
  env: { OPENAI_API_KEY: string }
): Promise<WhisperTranscriptionResult> {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  
  return await whisperTranscribeAudio(apiKey, audioFile);
}