import { VoiceVoxError } from "./errors";

type Mora = {
  text: string;
  consonant?: string;
  consonant_length?: number;
  vowel: string;
  vowel_length: number;
  pitch: number;
};

type AccentPhrase = {
  moras: Mora[];
  accent: number;
  pause_mora?: Mora;
  is_interrogative: boolean;
};

type AudioQuery = {
  accent_phrases: AccentPhrase[];
  speedScale: number;
  pitchScale: number;
  intonationScale: number;
  volumeScale: number;
  prePhonemeLength: number;
  postPhonemeLength: number;
  pauseLength: number;
  pauseLengthScale: number;
  outputSamplingRate: number;
  outputStereo: boolean;
  kana: string;
};

export class VoiceVoxClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders = {
    "Content-Type": "application/json",
  };

  constructor(baseUrl: string = "http://localhost:50021") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /** テキストから音声合成用のクエリを生成 */
  async createAudioQuery(text: string, speaker: number): Promise<AudioQuery> {
    try {
      const params = new URLSearchParams({ text, speaker: `${speaker}` });
      const res = await fetch(
        `${this.baseUrl}/audio_query?${params.toString()}`,
        {
          method: "POST",
          headers: this.defaultHeaders,
        },
      );
      if (!res.ok) {
        throw new VoiceVoxError(
          `API request failed: ${res.status} ${res.statusText}`,
        );
      }
      return (await res.json()) as AudioQuery;
    } catch (e) {
      throw new VoiceVoxError("Failed to create audio query", e);
    }
  }

  /** AudioQuery からバイナリの音声データを合成 */
  async synthesis(speaker: number, query: AudioQuery): Promise<ArrayBuffer> {
    try {
      const params = new URLSearchParams({ speaker: `${speaker}` });
      const response = await fetch(
        `${this.baseUrl}/synthesis?${params.toString()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        },
      );

      if (!response.ok) {
        throw new Error("VoiceVox API request failed");
      }
      return await response.arrayBuffer();
    } catch (e) {
      throw new VoiceVoxError("Failed to synthesize audio", e);
    }
  }
}
