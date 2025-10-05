import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat_wojtekmaj } from "../../utils/zodTextFormat_wojtekmaj";

// 回答の最大文字数定義
const ANSWER_MAX_LENGTH = 30;

const INSTRUCTIONS = `
* 語尾に'なのだ'または'のだ'を付けて${ANSWER_MAX_LENGTH}字以内で回答してください
* 回答は1つのみとしてください
`;

let prevId: string | undefined;

// LLM回答のスキーマ定義
const chatResponseSchema = z.object({
  answer: z
    .string()
    .max(ANSWER_MAX_LENGTH)
    .describe("ユーザーの質問に対する回答"),
});

export async function generateResponse(userMessage: string, apiKey: string) {
  const client = new OpenAI({ apiKey });
  const res = await client.responses.parse({
    model: "gpt-5-2025-08-07",
    input: [{ role: "user", content: userMessage }],
    previous_response_id: prevId,
    instructions: INSTRUCTIONS,
    text: {
      format: zodTextFormat_wojtekmaj(chatResponseSchema, "chat_response"),
    },
    tools: [{ type: "web_search_preview" }],
    tool_choice: "auto", // 必要に応じてweb search
  });

  const parsed = res.output_parsed;

  if (!parsed) {
    throw new Error("LLM output does not match the schema.");
  }

  console.log(`generatedAnswer: ${parsed.answer}`);
  prevId = res.id; // 会話履歴の保持用ID

  return parsed.answer;
}
