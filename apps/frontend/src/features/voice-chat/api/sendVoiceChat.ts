import { VoiceChatRequest, VoiceChatResponse } from "../types";

export const sendVoiceChat = async (
  request: VoiceChatRequest,
): Promise<VoiceChatResponse> => {
  const response = await fetch("http://localhost:8787/api/zundamon/voice-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: request.message,
    }),
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const data = await response.json();

  return data;
};