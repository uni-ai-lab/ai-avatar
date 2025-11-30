import { useState, useRef, useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { sendVoiceChatAudio } from "../api/sendVoiceChatAudio";
import { Message } from "../types";
import { useAudioPlayer } from "./useAudioPlayer";

type VoiceInputState = "idle" | "recording" | "processing" | "error";
type RecordingState = "idle" | "recording";

const MESSAGES_QUERY_KEY = ["voice-chat", "messages"];

/**
 * 音声入力を管理します。
 * @returns
 * - startRecording - 録音を開始する関数
 * - stopRecording - 録音を停止し、APIで送信する関数
 * - voiceInputState - 現在の状態 (idle | recording | processing | error)
 * - voiceInputError - エラーメッセージ
 */
export const useVoiceInput = () => {
  const queryClient = useQueryClient();
  const { playAudio, playSorry } = useAudioPlayer();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [voiceInputError, setVoiceInputError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const handleStartRecording = useCallback(async () => {
    setVoiceInputError(null);
    try {
      await startRecording();
    } catch (err) {
      console.error("Recording start error:", err);
      setVoiceInputError("マイクへのアクセスに失敗したのだ...");
      setTimeout(() => setVoiceInputError(null), 1500);
    }
  }, [startRecording]);

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

  const sendVoiceInputMutation = useMutation({
    mutationFn: async () => {
      // 録音停止してファイル取得
      const audioFile = await stopRecording();

      // API呼び出し
      const result = await sendVoiceChatAudio({ audio: audioFile });

      const userMessage: Message = {
        id: window.crypto.randomUUID(),
        text: result.userMessage,
        sender: "user",
        timestamp: result.timestamp,
      };

      const zundamonMessage: Message = {
        id: window.crypto.randomUUID(),
        text: result.zundamonResponse,
        sender: "zundamon",
        audioBase64: result.audioBase64,
        timestamp: result.timestamp,
      };

      return { userMessage, zundamonMessage };
    },
    onSuccess: (data) => {
      // ユーザー・ずんだもんのメッセージを追加
      queryClient.setQueryData(MESSAGES_QUERY_KEY, (old: Message[] = []) => [
        ...old,
        data.userMessage,
        data.zundamonMessage,
      ]);

      // 音声再生
      if (data.zundamonMessage.audioBase64) {
        playAudio(data.zundamonMessage.audioBase64);
      }
    },
    onError: (error) => {
      console.error("Voice chat error:", error);
      // エラー時のフォールバックメッセージ
      const errorMessage: Message = {
        id: window.crypto.randomUUID(),
        text: "ごめんなのだ〜、ちょっと調子が悪いのだ...",
        sender: "zundamon",
      };
      queryClient.setQueryData(MESSAGES_QUERY_KEY, (old: Message[] = []) => [
        ...old,
        errorMessage,
      ]);

      // エラー音声再生
      playSorry();
    },
  });

  const handleStopRecording = () => {
    sendVoiceInputMutation.mutate();
  };

  const getVoiceInputState = (): VoiceInputState => {
    if (voiceInputError || sendVoiceInputMutation.isError) return "error";
    if (recordingState === "recording") return "recording";
    if (sendVoiceInputMutation.isPending) return "processing";
    return "idle";
  };

  const voiceInputState = getVoiceInputState();

  return {
    voiceInputState,
    voiceInputError,
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
  };
};
