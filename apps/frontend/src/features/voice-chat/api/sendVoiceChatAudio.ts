import { VoiceChatAudioRequest, VoiceChatAudioResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sendVoiceChatAudio = async (
  request: VoiceChatAudioRequest,
): Promise<VoiceChatAudioResponse> => {
  const formData = new FormData();
  formData.append("audio", request.audio);

  const response = await fetch(
    `${API_BASE_URL}/api/zundamon/voice-chat/audio`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const data = await response.json();

  return data;
};
