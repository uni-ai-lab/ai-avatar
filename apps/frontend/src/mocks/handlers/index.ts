import { sendVoiceChatHandlers } from "./sendVoiceChatHandlers";
import { speechRecognitionHandlers } from "./speechRecognitionHandlers";

export const handlers = [
  ...sendVoiceChatHandlers,
  ...speechRecognitionHandlers,
];
