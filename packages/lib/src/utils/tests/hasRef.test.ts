import { describe, expect, it } from "vitest";
import { hasRef } from "../hasRef";

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
