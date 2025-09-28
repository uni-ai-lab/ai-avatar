import { useState, useRef, useCallback } from "react";
import { sendSpeechRecognition } from "../api/sendSpeechRecognition";

type RecordingState = "idle" | "recording" | "processing" | "error";

export const useSpeechRecognition = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [recognitionError, setRecognitionError] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleError = useCallback((error: Error) => {
    console.error("Speech Recognition Error:", error);

    const errorMessages = {
      NotAllowedError:
        "マイクの使用が許可されていません。ブラウザの設定でマイクを許可してください",
      NotFoundError:
        "マイクが見つかりません。マイクが接続されているか確認してください",
    } as const;

    const userMessage =
      errorMessages[error.name as keyof typeof errorMessages] ??
      "音声認識に失敗しました。しばらく時間をおいて再度お試しください";

    setRecognitionError(userMessage);
    setRecordingState("idle");
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setRecordingState("recording");
      setRecognitionError("");
      setRecognizedText(null);

      // マイク権限の取得
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // MediaRecorderの初期化
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          setRecordingState("processing");

          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const audioFile = new File([audioBlob], "recording.webm", {
            type: "audio/webm",
          });

          const response = await sendSpeechRecognition(audioFile);

          setRecognizedText(response.recognizedText);
          setRecordingState("idle");
        } catch (error) {
          handleError(error as Error);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.onerror = (event) => {
        handleError(new Error(`MediaRecorder error: ${event}`));
        stream.getTracks().forEach((track) => track.stop());
      };

      // 録音開始（ブラウザに最適化を任せる）
      mediaRecorder.start();
    } catch (error) {
      handleError(error as Error);
    }
  }, [handleError]);

  const stopRecording = useCallback(async () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    recordingState,
    recognizedText,
    recognitionError,
    startRecording,
    stopRecording,
  };
};
