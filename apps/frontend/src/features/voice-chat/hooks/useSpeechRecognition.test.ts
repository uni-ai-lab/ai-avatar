import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendSpeechRecognition } from "../api/sendSpeechRecognition";
import { useSpeechRecognition } from "./useSpeechRecognition";

// MediaRecorder のモック
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  state: "inactive",
  ondataavailable: null as ((event: BlobEvent) => void) | null,
  onstop: null as ((event: Event) => void) | null,
  onerror: null as ((event: Event) => void) | null,
};

const mockStream = {
  getTracks: vi.fn(() => [{ stop: vi.fn() }]),
} as unknown as MediaStream;

// グローバルAPIのモック
global.navigator = {
  ...global.navigator,
  mediaDevices: {
    getUserMedia: vi.fn().mockResolvedValue(mockStream),
  } as unknown as MediaDevices,
};

global.MediaRecorder = vi.fn(
  () => mockMediaRecorder,
) as unknown as typeof MediaRecorder;

// sendSpeechRecognition APIのモック
vi.mock("../api/sendSpeechRecognition", () => ({
  sendSpeechRecognition: vi.fn(),
}));

describe("useSpeechRecognition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMediaRecorder.state = "inactive";
    vi.mocked(sendSpeechRecognition).mockResolvedValue({
      recognizedText: "テスト音声認識結果",
    });
  });

  describe("基本動作", () => {
    it("初期状態が正しく設定される", () => {
      const { result } = renderHook(() => useSpeechRecognition());

      expect(result.current.recordingState).toBe("idle");
      expect(result.current.recognizedText).toBeNull();
      expect(result.current.recognitionError).toBe("");
    });

    it("録音を開始できる", async () => {
      const { result } = renderHook(() => useSpeechRecognition());

      await act(async () => {
        await result.current.startRecording();
      });

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
      });
      expect(mockMediaRecorder.start).toHaveBeenCalled();
      expect(result.current.recordingState).toBe("recording");
    });

    it("録音を停止できる", async () => {
      const { result } = renderHook(() => useSpeechRecognition());

      // 録音開始
      await act(async () => {
        await result.current.startRecording();
      });
      mockMediaRecorder.state = "recording";

      // 録音停止
      await act(async () => {
        await result.current.stopRecording();
      });

      expect(mockMediaRecorder.stop).toHaveBeenCalled();
    });
  });
});
