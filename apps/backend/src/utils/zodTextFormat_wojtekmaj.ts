// OpenAI が Zod v4 に対応したら削除する
// 参考: https://github.com/openai/openai-node/issues/1576
import { makeParseableTextFormat } from "openai/lib/parser";
import type { AutoParseableTextFormat } from "openai/lib/parser";
import type { ResponseFormatTextJSONSchemaConfig } from "openai/resources/responses/responses";
import { z } from "zod";

// wojtekmaj さんの実装
// https://github.com/openai/openai-node/issues/1576#issuecomment-3056734414
export function zodTextFormat_wojtekmaj<ZodInput extends z.ZodType>(
  zodObject: ZodInput,
  name: string,
  props?: Omit<
    ResponseFormatTextJSONSchemaConfig,
    "schema" | "type" | "strict" | "name"
  >,
): AutoParseableTextFormat<z.infer<ZodInput>> {
  return makeParseableTextFormat(
    {
      type: "json_schema",
      ...props,
      name,
      strict: true,
      schema: z.toJSONSchema(zodObject, { target: "draft-7" }),
    },
    (content) => zodObject.parse(JSON.parse(content)),
  );
}
