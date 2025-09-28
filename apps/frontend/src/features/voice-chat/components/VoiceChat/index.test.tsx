import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "test/test-utils";
import { VoiceChat } from "./index";

// scrollIntoViewメソッドのモック
Object.defineProperty(Element.prototype, "scrollIntoView", {
  value: vi.fn(),
  writable: true,
});

// フックのモック関数
const mockStartRecording = vi.fn();
const mockStopRecording = vi.fn();
const mockAddMessage = vi.fn();
const mockPlayHello = vi.fn();
const mockUseMessages = vi.fn();
const mockUseSpeechRecognition = vi.fn();
const mockUseAudioPlayer = vi.fn();

vi.mock("../../hooks/useMessages", () => ({
  useMessages: () => mockUseMessages(),
}));

vi.mock("../../hooks/useSpeechRecognition", () => ({
  useSpeechRecognition: () => mockUseSpeechRecognition(),
}));

vi.mock("../../hooks/useAudioPlayer", () => ({
  useAudioPlayer: () => mockUseAudioPlayer(),
}));

describe("VoiceChat", () => {
  const setupSpeechRecognition = (recordingState = "idle") => {
    mockUseSpeechRecognition.mockReturnValue({
      recordingState,
      recognizedText: null,
      recognitionError: "",
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    });
  };

  const setupMessages = (isAddingMessage = false) => {
    mockUseMessages.mockReturnValue({
      messages: [],
      addMessage: mockAddMessage,
      isAddingMessage,
    });
  };

  const setupAudioPlayer = () => {
    mockUseAudioPlayer.mockReturnValue({ playHello: mockPlayHello });
  };

  const startChat = () => {
    render(<VoiceChat />);
    fireEvent.click(screen.getByText("チャットを開始する"));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupSpeechRecognition();
    setupMessages();
    setupAudioPlayer();
  });

  it("チャット開始ボタンが表示される", () => {
    render(<VoiceChat />);
    expect(screen.getByText("チャットを開始する")).toBeInTheDocument();
  });

  describe("録音機能", () => {
    describe("状態変化", () => {
      it("待機状態では開始ボタンが表示される", () => {
        startChat();
        expect(
          screen.getByRole("button", { name: "録音を開始" }),
        ).toBeInTheDocument();
      });

      it("録音中は停止ボタンが表示される", () => {
        setupSpeechRecognition("recording");
        startChat();
        expect(
          screen.getByRole("button", { name: "録音を停止" }),
        ).toBeInTheDocument();
      });

      it("処理中は処理中ボタンが表示される", () => {
        setupSpeechRecognition("processing");
        startChat();
        expect(
          screen.getByRole("button", { name: "音声認識処理中" }),
        ).toBeInTheDocument();
      });
    });

    describe("ボタンの無効化", () => {
      it("処理中は録音ボタンが無効化される", () => {
        setupSpeechRecognition("processing");
        startChat();
        expect(
          screen.getByRole("button", { name: "音声認識処理中" }),
        ).toBeDisabled();
      });

      it("メッセージ送信中は録音ボタンが無効化される", () => {
        setupMessages(true);
        startChat();
        expect(
          screen.getByRole("button", { name: "録音を開始" }),
        ).toBeDisabled();
      });
    });

    describe("ユーザー操作", () => {
      it("録音ボタンをクリックすると録音が開始される", () => {
        startChat();
        fireEvent.click(screen.getByRole("button", { name: "録音を開始" }));
        expect(mockStartRecording).toHaveBeenCalledOnce();
      });

      it("録音停止ボタンをクリックすると録音が停止される", () => {
        setupSpeechRecognition("recording");
        startChat();
        fireEvent.click(screen.getByRole("button", { name: "録音を停止" }));
        expect(mockStopRecording).toHaveBeenCalledOnce();
      });
    });
  });
});
