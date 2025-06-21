import { toBase64 } from "./base64";
import { VoiceVoxClient } from "./client";
import { VoiceVoxError } from "./errors";

const client = new VoiceVoxClient();

async function fetchAudioBuffer(
  text: string,
  speaker: number,
): Promise<ArrayBuffer> {
  const query = await client.createAudioQuery(text, speaker);
  return client.synthesis(speaker, query);
}

/**
 * テキストを音声として合成し、Base64 エンコード文字列を返却
 * @param text 合成するテキスト
 * @param speaker VoiceVox で使用する話者 ID
 */
export async function generateSpeech(
  text: string,
  speaker: number,
): Promise<string> {
  try {
    const audioBuffer = await fetchAudioBuffer(text, speaker);
    return toBase64(audioBuffer);
  } catch (error) {
    console.error("generateSpeech error:", error);
    if (error instanceof VoiceVoxError) {
      throw error;
    }
    throw new VoiceVoxError("Unexpected error in generateSpeech", error);
  }
}
