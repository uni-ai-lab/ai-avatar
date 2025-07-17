import { http, HttpResponse, delay } from "msw";
import { VoiceChatRequest } from "../../features/voice-chat/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sendVoiceChatHandlers = [
  http.post<never, VoiceChatRequest>(
    `${API_BASE_URL}/api/zundamon/voice-chat`,
    async ({ request }) => {
      const requestBody = await request.json();
      const { message } = requestBody;

      await delay(2000);

      if (message) {
        const date = new Date();
        const hours = date.getHours();
        const minute = date.getMinutes();

        const num = Math.random() * 10;
        console.log("num: ", num);

        if (Math.trunc(num) == 4) {
          return HttpResponse.json({
            userMessage: message,
            zundamonResponse: "ｺﾛｼﾃ…ｺﾛｼﾃ…",
            status: 200,
          });
        } else {
          return HttpResponse.json({
            userMessage: message,
            zundamonResponse: `今は ${hours} 時 ${minute} 分 なのだ 🫛`,
            status: 200,
          });
        }
      }
    },
  ),
];
