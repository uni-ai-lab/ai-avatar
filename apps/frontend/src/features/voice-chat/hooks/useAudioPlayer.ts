/**
 * Base64もしくは外部テキストファイルからWAV音声を再生します。
 * @returns
 * - playAudio - 渡されたBase64データを再生する関数
 * - playHello - 「こんにちはなのだ！何でも聞いてほしいのだ！」を再生する関数
 * - playSorry - 「ごめんなのだ〜、ちょっと調子が悪いのだ...」を再生する関数
 */
export const useAudioPlayer = () => {
  // Base64文字列をデコードして再生
  const decodeAndPlay = (base64: string) => {
    try {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play().catch((e) => console.error("Audio play error:", e));
    } catch (err) {
      console.error("Failed to decode/play audio:", err);
    }
  };

  /**
   * 再生関数: 渡されたBase64データを再生します。
   */
  const playAudio = (base64Data?: string) => {
    if (base64Data) {
      decodeAndPlay(base64Data);
    }
  };

  /**
   * 再生関数: 「こんにちはなのだ！何でも聞いてほしいのだ！」
   */
  const playHello = async () => {
    const { default: helloBase64 } = await import(
      "assets/wav-base64/hello.txt?raw"
    );
    decodeAndPlay(helloBase64);
  };

  /**
   * 再生関数: 「ごめんなのだ〜、ちょっと調子が悪いのだ...」
   */
  const playSorry = async () => {
    const { default: sorryBase64 } = await import(
      "assets/wav-base64/sorry.txt?raw"
    );
    decodeAndPlay(sorryBase64);
  };

  return { playAudio, playHello, playSorry };
};
