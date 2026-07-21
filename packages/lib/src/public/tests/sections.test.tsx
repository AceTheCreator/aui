import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AsyncAPIDocumentData } from "../../types/schema";
import { AsyncAPIProvider, Operations, Servers, Messages, Info } from "../sections";

const asDoc = (doc: unknown) => doc as AsyncAPIDocumentData;

const doc = {
  asyncapi: "3.0.0",
  info: { title: "Streetlights", version: "1.0.0" },
  servers: {
    production: { host: "broker.example.com", protocol: "kafka" },
  },
  channels: {
    lightingChannel: { address: "smartylighting/measured", messages: {} },
  },
  operations: {
    receiveMeasurement: {
      action: "receive",
      channel: { $ref: "#/channels/lightingChannel" },
      summary: "Receive a lighting measurement",
    },
  },
  components: {
    messages: {
      lightMeasured: { title: "Light measured", payload: { type: "object" } },
    },
  },
};

describe("standalone section components", () => {
  it("renders <Operations document={...}> on its own, without an ambient provider", () => {
    render(<Operations document={asDoc(doc)} />);
    // The operations table renders its channel address — proof it mounted with
    // a working document context (no useAsyncAPIDocument throw, $ref resolved).
    expect(document.body.textContent).toContain("smartylighting/measured");
    expect(document.body.textContent).not.toContain("$ref");
  });

  it("renders <Info document={...}> on its own", () => {
    render(<Info document={asDoc(doc)} />);
    expect(screen.getByText("Streetlights")).toBeInTheDocument();
  });

  it("composes several sections under one <AsyncAPIProvider> (no per-section document)", () => {
    render(
      <AsyncAPIProvider document={asDoc(doc)}>
        <Servers />
        <Operations />
        <Messages />
      </AsyncAPIProvider>,
    );
    const text = document.body.textContent ?? "";
    expect(text).toContain("broker.example.com"); // Servers
    expect(text).toContain("smartylighting/measured"); // Operations
    expect(text).toContain("Light measured"); // Messages
  });

  it("throws a helpful error when used with neither a document prop nor a provider", () => {
    // Silence the expected React error boundary logging for this case.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Operations />)).toThrow(/needs a `document` prop/);
    spy.mockRestore();
  });
});
