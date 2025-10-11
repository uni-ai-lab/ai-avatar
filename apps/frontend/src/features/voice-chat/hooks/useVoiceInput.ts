import { useState, useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { sendVoiceChatAudio } from "../api/sendVoiceChatAudio";
import { Message } from "../types";
import { useAudioPlayer } from "./useAudioPlayer";

type VoiceInputState = "idle" | "recording" | "processing" | "error";

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
  const {
    recordingState,
    startRecording,
    stopRecording,
    playAudio,
    playSorry,
  } = useAudioPlayer();
  const [voiceInputError, setVoiceInputError] = useState<string | null>(null);

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
