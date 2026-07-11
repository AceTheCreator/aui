import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AsyncAPI from "../AsyncAPI";
import exampleDoc from "../../../config/examples/example1.json";

describe("AsyncAPI", () => {
  it("renders the document title and resolves $refs into the operations list", () => {
    render(<AsyncAPI asyncapi={exampleDoc as any} />);

    expect(screen.getByRole("heading", { name: "Streetlights Kafka API" })).toBeInTheDocument();

    // The "turnOn" operation only carries a `channel: { $ref: "#/channels/lightTurnOn" }` —
    // seeing the resolved address (not a raw "$ref" string) proves resolveRefs/deref ran end-to-end.
    // ChannelAddress splits the address across sibling spans at each {param} boundary, so a
    // single getByText regex can't match it — check the rendered text as a whole instead.
    const bodyText = document.body.textContent ?? "";
    expect(bodyText).toContain("smartylighting.streetlights.1.0.action.");
    expect(bodyText).toContain(".turn.on");
    expect(bodyText).not.toContain("$ref");
  });

  it("hides the servers section when show.servers is false", () => {
    render(<AsyncAPI asyncapi={exampleDoc as any} config={{ show: { servers: false } }} />);

    expect(screen.queryByText("test.mykafkacluster.org", { exact: false })).not.toBeInTheDocument();
  });

  it("applies an expand.schemas config change to already-mounted schema trees", () => {
    // Minimal doc with a nested object property — `source` only renders while its
    // parent `metadata` node is expanded, which is what expand.schemas controls.
    const nestedDoc = {
      asyncapi: "3.0.0",
      info: { title: "Nested", version: "1.0.0" },
      components: {
        schemas: {
          widget: {
            type: "object",
            properties: {
              metadata: {
                type: "object",
                properties: { source: { type: "string" } },
              },
            },
          },
        },
      },
    };

    const { rerender } = render(
      <AsyncAPI asyncapi={nestedDoc as any} config={{ expand: { schemas: false } }} />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Schemas" }));
    const panel = () => within(document.getElementById("panel-schemas")!);
    expect(panel().getByText("metadata")).toBeInTheDocument();
    expect(panel().queryByText("source")).not.toBeInTheDocument();

    rerender(<AsyncAPI asyncapi={nestedDoc as any} config={{ expand: { schemas: true } }} />);
    expect(panel().getByText("source")).toBeInTheDocument();

    rerender(<AsyncAPI asyncapi={nestedDoc as any} config={{ expand: { schemas: false } }} />);
    expect(panel().queryByText("source")).not.toBeInTheDocument();
  });

  it("switches away from the active tab when a config change hides it", () => {
    const { rerender } = render(<AsyncAPI asyncapi={exampleDoc as any} />);

    expect(document.getElementById("panel-operations")).not.toBeNull();

    rerender(<AsyncAPI asyncapi={exampleDoc as any} config={{ show: { operations: false } }} />);
    expect(document.getElementById("panel-operations")).toBeNull();
    expect(document.getElementById("panel-messages")).not.toBeNull();
  });
});
