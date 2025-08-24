import { SpeechRecognitionResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sendSpeechRecognition = async (
  audioFile: File,
): Promise<SpeechRecognitionResponse> => {
  const formData = new FormData();
  formData.append("audio", audioFile);

  const response = await fetch(
    `${API_BASE_URL}/api/zundamon/speech-recognition`,
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
