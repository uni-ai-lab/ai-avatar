import { Buffer } from "buffer";

/** ArrayBuffer を Base64 文字列に変換 */
export function toBase64(data: ArrayBuffer): string {
  return Buffer.from(data).toString("base64");
}
