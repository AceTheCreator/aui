import { render, screen } from "@testing-library/react";
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
});
