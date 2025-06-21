import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendVoiceChat } from "../api/sendVoiceChat";
import { Message, VoiceChatResponse } from "../types";
import { useAudioPlayer } from "./useAudioPlayer";

const MESSAGES_QUERY_KEY = ["voice-chat", "messages"];

const getInitialMessages = (): Message[] => [
  {
    id: "initial-message",
    text: "こんにちはなのだ！何でも聞いてほしいのだ！",
    sender: "zundamon",
  },
];

export const useMessages = () => {
  const queryClient = useQueryClient();
  const { playAudio, playSorry } = useAudioPlayer();

  const { data: messages = [] } = useQuery({
    queryKey: MESSAGES_QUERY_KEY,
    queryFn: getInitialMessages,
    staleTime: Infinity,
  });

  const addMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const userMessage: Message = {
        id: window.crypto.randomUUID(),
        text: messageText,
        sender: "user",
      };

      // ユーザーメッセージを即座に追加
      queryClient.setQueryData(MESSAGES_QUERY_KEY, (old: Message[] = []) => [
        ...old,
        userMessage,
      ]);

      // API呼び出し
      const response: VoiceChatResponse = await sendVoiceChat({
        message: messageText,
      });

      const zundamonMessage: Message = {
        id: window.crypto.randomUUID(),
        text: response.zundamonResponse,
        sender: "zundamon",
        audioBase64: response.audioBase64,
        timestamp: response.timestamp,
      };

      return { userMessage, zundamonMessage };
    },
    onSuccess: (data) => {
      // ずんだもんのメッセージを追加
      queryClient.setQueryData(MESSAGES_QUERY_KEY, (old: Message[] = []) => [
        ...old,
        data.zundamonMessage,
      ]);

      // 音声再生
      playAudio(data.zundamonMessage.audioBase64);
    },
    onError: (error) => {
      console.error("API Error:", error);
      // エラー時のフォールバック処理
      const errorMessage: Message = {
        id: window.crypto.randomUUID(),
        text: "ごめんなのだ〜、ちょっと調子が悪いのだ...",
        sender: "zundamon",
      };
      queryClient.setQueryData(MESSAGES_QUERY_KEY, (old: Message[] = []) => [
        ...old,
        errorMessage,
      ]);

      // 音声再生
      playSorry();
    },
  });

  return {
    messages,
    addMessage: addMessageMutation.mutate,
    isAddingMessage: addMessageMutation.isPending,
  };
};
