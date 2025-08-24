import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecordButton } from "./index";

describe("RecordButton", () => {
  const defaultProps = {
    isRecording: false,
    isProcessing: false,
    onStartRecording: vi.fn(),
    onStopRecording: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("基本表示", () => {
    it("待機状態でマイクアイコンが表示される", () => {
      render(<RecordButton {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "録音を開始" }),
      ).toBeInTheDocument();
    });

    it("録音状態でマイクオフアイコンが表示される", () => {
      render(<RecordButton {...defaultProps} isRecording={true} />);

      expect(
        screen.getByRole("button", { name: "録音を停止" }),
      ).toBeInTheDocument();
    });

    it("処理状態でローダーアイコンが表示される", () => {
      render(<RecordButton {...defaultProps} isProcessing={true} />);

      expect(
        screen.getByRole("button", { name: "音声認識処理中" }),
      ).toBeInTheDocument();
    });
  });

  describe("ボタン操作", () => {
    it("待機状態でクリックすると録音開始関数が呼ばれる", () => {
      render(<RecordButton {...defaultProps} />);

      fireEvent.click(screen.getByRole("button"));

      expect(defaultProps.onStartRecording).toHaveBeenCalledOnce();
      expect(defaultProps.onStopRecording).not.toHaveBeenCalled();
    });

    it("録音状態でクリックすると録音停止関数が呼ばれる", () => {
      render(<RecordButton {...defaultProps} isRecording={true} />);

      fireEvent.click(screen.getByRole("button"));

      expect(defaultProps.onStopRecording).toHaveBeenCalledOnce();
      expect(defaultProps.onStartRecording).not.toHaveBeenCalled();
    });
  });

  describe("ボタンの無効化", () => {
    it("disabled=trueでボタンが無効化される", () => {
      render(<RecordButton {...defaultProps} disabled={true} />);

      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("処理中はボタンが無効化される", () => {
      render(<RecordButton {...defaultProps} isProcessing={true} />);

      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("無効化されたボタンをクリックしても関数が呼ばれない", () => {
      render(<RecordButton {...defaultProps} disabled={true} />);

      fireEvent.click(screen.getByRole("button"));

      expect(defaultProps.onStartRecording).not.toHaveBeenCalled();
      expect(defaultProps.onStopRecording).not.toHaveBeenCalled();
    });
  });
});
