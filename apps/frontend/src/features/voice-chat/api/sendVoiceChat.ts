import { VoiceChatRequest, VoiceChatResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sendVoiceChat = async (
  request: VoiceChatRequest,
): Promise<VoiceChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/zundamon/voice-chat`, {
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