import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

async function enableMocking() {
  if (import.meta.env.VITE_API_MOCKING === "true") {
    const { worker } = await import("./mocks/browser");

    return worker.start();
  }
}

enableMocking().then(() => {
  const queryClient = new QueryClient();
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
});
