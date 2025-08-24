import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { AllTheProviders } from "./AllProviders";

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// eslint-disable-next-line react-refresh/only-export-components, import/export
export * from "@testing-library/react";
// eslint-disable-next-line import/export
export { customRender as render };
