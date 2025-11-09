import { z } from "zod";

export const voiceChatSchema = z.object({
  message: z.string().trim().min(1, "1文字以上入力するのだ"),
});

export type VoiceChatSchema = z.infer<typeof voiceChatSchema>;
