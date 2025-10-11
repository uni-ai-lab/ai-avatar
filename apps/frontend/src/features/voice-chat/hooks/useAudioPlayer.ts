import { useState, useRef, useCallback } from "react";

type RecordingState = "idle" | "recording";

/**
 * 音声の録音と再生を管理します。
 * @returns
 * - playAudio - 渡されたBase64データを再生する関数
 * - playHello - 「こんにちはなのだ！何でも聞いてほしいのだ！」を再生する関数
 * - playSorry - 「ごめんなのだ〜、ちょっと調子が悪いのだ...」を再生する関数
 * - recordingState - 録音状態 (idle | recording)
 * - startRecording - 録音を開始する関数（Promise、エラー時はthrow）
 * - stopRecording - 録音を停止し、録音ファイルを返す関数（Promise<File>）
 */
export const useAudioPlayer = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // Base64文字列をデコードして再生
  const decodeAndPlay = (base64: string) => {
    try {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.addEventListener("ended", () => {
        URL.revokeObjectURL(url);
      });
      audio.play().catch((e) => console.error("Audio play error:", e));
    } catch (err) {
      console.error("Failed to decode/play audio:", err);
    }
  };

  /**
   * 再生関数: 渡されたBase64データを再生します。
   */
  const playAudio = (base64Data?: string) => {
    if (base64Data) {
      decodeAndPlay(base64Data);
    }
  };

  /**
   * 再生関数: 「こんにちはなのだ！何でも聞いてほしいのだ！」
   */
  const playHello = async () => {
    const { default: helloBase64 } = await import(
      "assets/wav-base64/hello.txt?raw"
    );
    decodeAndPlay(helloBase64);
  };

  /**
   * 再生関数: 「ごめんなのだ〜、ちょっと調子が悪いのだ...」
   */
  const playSorry = async () => {
    const { default: sorryBase64 } = await import(
      "assets/wav-base64/sorry.txt?raw"
    );
    decodeAndPlay(sorryBase64);
  };

  /**
   * 録音開始関数
   * @throws マイクアクセスに失敗した場合
   */
  const startRecording = useCallback(async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start();
    setRecordingState("recording");
  }, []);

  /**
   * 録音停止関数
   * @returns 録音された音声ファイル
   * @throws 録音中でない場合、または録音停止に失敗した場合
   */
  const stopRecording = useCallback((): Promise<File> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || recordingState !== "recording") {
        reject(new Error("録音中ではありません"));
        return;
      }

      mediaRecorder.onstop = async () => {
        try {
          const stream = mediaRecorder.stream;
          stream.getTracks().forEach((track) => track.stop());

          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const audioFile = new File([audioBlob], "recording.webm", {
            type: "audio/webm",
          });

          setRecordingState("idle");
          resolve(audioFile);
        } catch (err) {
          setRecordingState("idle");
          reject(err);
        }
      };

      mediaRecorder.stop();
    });
  }, [recordingState]);

  return {
    playAudio,
    playHello,
    playSorry,
    recordingState,
    startRecording,
    stopRecording,
  };
};
