export interface VoiceChatRequest {
  message: string;
}

export interface VoiceChatResponse {
  userMessage: string;
  zundamonResponse: string;
  timestamp: string;
}

export interface Message {
  id: number;
  text: string;
  sender: "user" | "zundamon";
  timestamp?: string;
}