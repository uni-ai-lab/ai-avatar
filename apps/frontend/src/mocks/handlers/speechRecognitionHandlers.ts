import { http, HttpResponse, delay } from "msw";
import { SpeechRecognitionResponse } from "../../features/voice-chat/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 開発用デバッグ機能
const logAudioAsBase64 = async (audioFile: File) => {
  const arrayBuffer = await audioFile.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const base64 = btoa(String.fromCharCode(...uint8Array));

  // ダウンロードURL作成
  const blob = new Blob([arrayBuffer], { type: audioFile.type });
  const downloadUrl = URL.createObjectURL(blob);

  console.group(`🎤 Audio Debug - ${new Date().toISOString()}`);
  console.log(`📊 File Info:`, {
    name: audioFile.name,
    size: `${audioFile.size} bytes`,
    type: audioFile.type,
  });
  console.log(`📋 Base64 Audio Data:`);
  console.log(base64);
  console.log(`🎵 再生URL:`);
  console.log(downloadUrl);
  console.groupEnd();

  // 5分後にURLを解放（メモリリーク防止）
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5 * 60 * 1000);
};

// 事前定義されたユーザー音声入力のテストデータ
const mockUserInputs = [
  "こんにちは、ずんだもん",
  "今日の天気はどうですか",
  "ずんだもちについて教えて",
  "プログラミングの相談があります",
];

/**
 * 音声認識API のモックハンドラー
 *
 * ## 責務
 * - 音声ファイルを受け取り、模擬的な音声認識結果を返却
 * - 開発時の手動テストでエラーハンドリングを検証可能
 * - 受信した音声データをBase64形式でコンソール出力（デバッグ用）
 *
 * ## エラー率制御
 * URLクエリパラメータ `mockError` でエラー発生率を制御：
 * - 指定なし: 30%エラー率（デフォルト）
 * - `?mockError=0`: エラーなし（単体テスト用）
 * - `?mockError=1`: 必ずエラー（エラーハンドリングテスト用）
 * - `?mockError=0.5`: 50%エラー率（任意の値）
 *
 * ## デバッグ機能
 * - 受信した音声ファイルをBase64形式でコンソール出力
 * - 再生URL（blob:）をコンソール出力
 * - ファイル情報（サイズ、形式）も併せて出力
 *
 * ### 音声ファイル再生方法
 * 1. コンソールログの「🎵 再生URL:」の下に出力されるURLをコピー
 * 2. 新しいタブに貼り付けて開く（再生またはダウンロード）
 * 3. **注意**: `blob:http://localhost:5173/xxxxx` 全体をコピーすること
 *    - `http://` 部分だけでなく、`blob:` から始まる完全なURLが必要
 *
 * ## 使用例
 * ```
 * // 通常開発（30%エラー）
 * http://localhost:5173/
 *
 * // テスト用（エラーなし）
 * http://localhost:5173/?mockError=0
 *
 * // エラーハンドリングテスト用
 * http://localhost:5173/?mockError=1
 * ```
 */
export const speechRecognitionHandlers = [
  http.post<never, never>(
    `${API_BASE_URL}/api/zundamon/speech-recognition`,
    async ({ request }) => {
      try {
        const formData = await request.formData();
        const audioFile = formData.get("audio") as File | null;

        if (!audioFile) {
          return HttpResponse.json(
            { error: "Audio file is required" },
            { status: 400 },
          );
        }
        await logAudioAsBase64(audioFile);

        const url = new URL(request.url);

        // クエリパラメータでエラー率を制御
        const mockErrorParam = url.searchParams.get("mockError");
        const errorRate = mockErrorParam ? parseFloat(mockErrorParam) : 0.3;
        const shouldSimulateError = Math.random() < errorRate;

        // リアルタイム感を演出するための遅延（1.5-3秒）
        const processingTime = 1500 + Math.random() * 1500;
        await delay(processingTime);

        if (shouldSimulateError) {
          console.log(
            `🎭 Mock: エラーレスポンスをシミュレート中（エラー率: ${errorRate}）`,
          );
          return HttpResponse.json(
            { error: "Speech recognition failed" },
            { status: 500 },
          );
        }

        const randomUserInput =
          mockUserInputs[Math.floor(Math.random() * mockUserInputs.length)];

        const response: SpeechRecognitionResponse = {
          recognizedText: randomUserInput,
        };

        console.log(
          `🎭 Mock: 正常レスポンスを返却中（エラー率: ${errorRate}）`,
          response,
        );
        return HttpResponse.json(response);
      } catch (error) {
        console.error("Speech Recognition Handler Error:", error);

        return HttpResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
    },
  ),
];
