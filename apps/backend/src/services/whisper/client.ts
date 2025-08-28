import OpenAI from "openai";

export interface WhisperTranscriptionResult {
  text: string;
  language: string;
}

export class WhisperClient {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async transcribeAudio(audioFile: File): Promise<WhisperTranscriptionResult> {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
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
  }
}