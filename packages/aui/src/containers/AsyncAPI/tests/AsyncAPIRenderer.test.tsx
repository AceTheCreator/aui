import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AsyncAPIRenderer } from "../AsyncAPIRenderer";
import exampleDoc from "../../../config/examples/example1.json";

const raw = JSON.stringify(exampleDoc);

describe("AsyncAPIRenderer", () => {
  it("parses the raw document asynchronously and renders it once resolved", async () => {
    render(<AsyncAPIRenderer raw={raw} />);

    // Nothing is rendered synchronously — parsing is async, so use findBy* to wait for it.
    expect(await screen.findByRole("heading", { name: "Streetlights Kafka API" })).toBeInTheDocument();
  });

  it("reports parser diagnostics once parsing completes", async () => {
    const onDiagnostics = vi.fn();
    render(<AsyncAPIRenderer raw={raw} onDiagnostics={onDiagnostics} />);

    await screen.findByRole("heading", { name: "Streetlights Kafka API" });

    expect(onDiagnostics).toHaveBeenCalledTimes(1);
    expect(Array.isArray(onDiagnostics.mock.calls[0][0])).toBe(true);
  });

  it("renders nothing for a document that fails to parse", async () => {
    const onDiagnostics = vi.fn();
    const { container } = render(<AsyncAPIRenderer raw="not a valid asyncapi document" onDiagnostics={onDiagnostics} />);

    await vi.waitFor(() => expect(onDiagnostics).toHaveBeenCalled());

    expect(container).toBeEmptyDOMElement();
  });

  it("re-parses when raw changes and reflects the new document", async () => {
    const { rerender } = render(<AsyncAPIRenderer raw={raw} />);
    await screen.findByRole("heading", { name: "Streetlights Kafka API" });

    const updatedRaw = JSON.stringify({
      ...exampleDoc,
      info: { ...exampleDoc.info, title: "Updated API" },
    });
    rerender(<AsyncAPIRenderer raw={updatedRaw} />);

    expect(await screen.findByRole("heading", { name: "Updated API" })).toBeInTheDocument();
  });
});
