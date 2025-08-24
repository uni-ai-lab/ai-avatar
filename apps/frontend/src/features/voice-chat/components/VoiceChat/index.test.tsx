import { describe, it, expect } from "vitest";
import { render, screen } from "test/test-utils";
import { VoiceChat } from "./index";

describe("VoiceChat", () => {
  it("チャット開始ボタンが表示されること", () => {
    render(<VoiceChat />);

    expect(screen.getByText("チャットを開始する")).toBeInTheDocument();
  });
});
