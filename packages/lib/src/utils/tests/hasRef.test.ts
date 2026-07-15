import { describe, expect, it } from "vitest";
import { hasRef, resolveRefs } from "../hasRef";

describe("hasRef", () => {
  it("returns true for an object with a string $ref", () => {
    expect(hasRef({ $ref: "#/components/schemas/Foo" })).toBe(true);
  });

  it("returns false for objects without $ref", () => {
    expect(hasRef({ type: "string" })).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(hasRef(null)).toBe(false);
    expect(hasRef("a string")).toBe(false);
    expect(hasRef(42)).toBe(false);
  });
});

describe("resolveRefs", () => {
  it("replaces a top-level $ref in place with the resolved value", () => {
    const deref = (ref: string) => (ref === "#/foo" ? { type: "string" } : undefined);
    const value: { $ref: string; type?: string } = { $ref: "#/foo" };

    const result = resolveRefs(value, deref);

    expect(result).toBe(value);
    expect(value).toEqual({ type: "string" });
  });

  it("resolves nested $refs inside objects and arrays", () => {
    const schemas: Record<string, unknown> = {
      Foo: { type: "string" },
      Bar: { type: "number" },
    };
    const deref = (ref: string) => schemas[ref.replace("#/", "")];

    const value = {
      properties: {
        a: { $ref: "#/Foo" },
      },
      items: [{ $ref: "#/Bar" }],
    };

    resolveRefs(value, deref);

    expect(value.properties.a).toEqual({ type: "string" });
    expect(value.items[0]).toEqual({ type: "number" });
  });

  it("does not loop forever on circular references", () => {
    const node: Record<string, unknown> = { name: "self" };
    node.child = node;

    expect(() => resolveRefs(node, () => undefined)).not.toThrow();
  });
});
