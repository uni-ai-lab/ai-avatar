export interface VoiceChatRequest {
  message: string;
}

export interface VoiceChatResponse {
  userMessage: string;
  zundamonResponse: string;
  audioBase64: string;
  timestamp: string;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "zundamon";
  audioBase64: string | null;
  timestamp?: string;
}
