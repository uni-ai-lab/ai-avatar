import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const INSTRUCTIONS = "* 語尾に'なのだ'または'のだ'を付けて20字程度で回答してください\n* 回答は1つのみとしてください";
let prevId: string | undefined;

export async function generateResponse(userMessage: string) {
    const q = userMessage;

    const res = await client.responses.create({
      model: "gpt-5-2025-08-07",
      input: [{ role: "user", content: q }],
      previous_response_id: prevId,
      instructions: INSTRUCTIONS,
    });

    console.log(res.output_text);
    prevId = res.id; // 会話履歴の保持用ID

    return res.output_text;
}