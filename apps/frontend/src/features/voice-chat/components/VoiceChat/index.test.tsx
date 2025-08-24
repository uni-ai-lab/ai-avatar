import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VoiceChat } from "./index";

describe("VoiceChat", () => {
  it("チャット開始ボタンが表示されること", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <VoiceChat />
      </QueryClientProvider>,
    );

    expect(screen.getByText("チャットを開始する")).toBeInTheDocument();
  });
});
