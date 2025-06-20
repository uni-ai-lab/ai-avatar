import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendVoiceChat } from "../api/sendVoiceChat";
import { Message, VoiceChatResponse } from "../types";

const MESSAGES_QUERY_KEY = ["voice-chat", "messages"];

const getInitialMessages = (): Message[] => [
  {
    id: "initial-message",
    text: "こんにちはなのだ！何でも聞いてほしいのだ！",
    sender: "zundamon",
    audioBase64: null,
  },
];

export const useMessages = () => {
  const queryClient = useQueryClient();

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
        audioBase64: null,
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
      if (data.zundamonMessage.audioBase64) {
        const audioBlob = new Blob(
          [
            Uint8Array.from(atob(data.zundamonMessage.audioBase64), (c) =>
              c.charCodeAt(0),
            ),
          ],
          { type: "audio/wav" },
        );
        const url = URL.createObjectURL(audioBlob);
        if (url) {
          const audioElement = new Audio(url);
          audioElement.play().catch((error) => {
            console.error("Audio playback error:", error);
          });
        }
      }
    },
    onError: (error) => {
      console.error("API Error:", error);
      // エラー時のフォールバック処理
      const errorMessage: Message = {
        id: window.crypto.randomUUID(),
        text: "ごめんなのだ〜、ちょっと調子が悪いのだ...",
        sender: "zundamon",
        audioBase64: null,
      };
      queryClient.setQueryData(MESSAGES_QUERY_KEY, (old: Message[] = []) => [
        ...old,
        errorMessage,
      ]);
    },
  });

  return {
    messages,
    addMessage: addMessageMutation.mutate,
    isAddingMessage: addMessageMutation.isPending,
  };
};
