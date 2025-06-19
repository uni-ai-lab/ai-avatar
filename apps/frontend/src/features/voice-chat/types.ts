export interface VoiceChatRequest {
  message: string;
}

export interface VoiceChatResponse {
  userMessage: string;
  zundamonResponse: string;
  timestamp: string;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "zundamon";
  timestamp?: string;
}