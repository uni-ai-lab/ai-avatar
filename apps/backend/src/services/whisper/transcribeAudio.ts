import { WhisperClient, WhisperTranscriptionResult } from "./client";

export async function transcribeAudio(
  audioFile: File,
  env: { OPENAI_API_KEY: string }
): Promise<WhisperTranscriptionResult> {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  
  const client = new WhisperClient(apiKey);
  return await client.transcribeAudio(audioFile);
}