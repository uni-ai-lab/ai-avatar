import OpenAI from "openai";
import { TranscriptionVerbose } from "openai/resources/audio.mjs";

export interface WhisperTranscriptionResult {
  text: string;
  language: string;
}

export const transcribeAudio = async (
  apiKey: string,
  audioFile: File,
): Promise<WhisperTranscriptionResult> => {
  const openai = new OpenAI({
    apiKey,
  });

  try {
    const transcription: TranscriptionVerbose & {
      _request_id?: string | null;
    } = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json",
    });

    return {
      text: transcription.text,
      language: transcription.language || "unknown",
    };
  } catch (error) {
    console.error("Whisper transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
};
