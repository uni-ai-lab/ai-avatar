export interface VoiceChatRequest {
  message: string;
}

export interface VoiceChatResponse {
  userMessage: string;
  zundamonResponse: string;
  timestamp: string;
}