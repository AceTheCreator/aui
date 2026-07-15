import { describe, expect, it } from "vitest";
import { avroToJsonSchema } from "../avroToJsonSchema";
import type { AvroSchema } from "../types";

const BYTES_PATTERN = "^[\u0000-\u00ff]*$";

describe("avroToJsonSchema", () => {
  describe("primitives", () => {
    it("converts primitive type strings", () => {
      expect(avroToJsonSchema("string")).toEqual({ type: "string" });
      expect(avroToJsonSchema("boolean")).toEqual({ type: "boolean" });
      expect(avroToJsonSchema("null")).toEqual({ type: "null" });
    });

    it("adds 32-bit bounds to int", () => {
      expect(avroToJsonSchema({ type: "int" })).toEqual({
        type: "integer",
        minimum: -(2 ** 31),
        maximum: 2 ** 31 - 1,
      });
    });

    it("adds 64-bit bounds to long", () => {
      expect(avroToJsonSchema("long")).toEqual({
        type: "integer",
        minimum: -(2 ** 63),
        maximum: 2 ** 63 - 1,
      });
    });

    it("maps float and double to number with a format", () => {
      expect(avroToJsonSchema("float")).toEqual({
        type: "number",
        format: "float",
      });
      expect(avroToJsonSchema("double")).toEqual({
        type: "number",
        format: "double",
      });
    });

    it("maps bytes to a byte-range string pattern", () => {
      expect(avroToJsonSchema("bytes")).toEqual({
        type: "string",
        pattern: BYTES_PATTERN,
      });
    });

    it("maps fixed to a length-constrained string", () => {
      expect(
        avroToJsonSchema({ type: "fixed", name: "MD5", size: 16 }),
      ).toEqual({
        type: "string",
        pattern: BYTES_PATTERN,
        minLength: 16,
        maxLength: 16,
      });
    });
  });

  it("maps enum symbols", () => {
    expect(
      avroToJsonSchema({
        type: "enum",
        name: "Status",
        doc: "Operational status",
        symbols: ["ON", "OFF"],
      }),
    ).toEqual({
      type: "string",
      enum: ["ON", "OFF"],
      description: "Operational status",
    });
  });

  it("maps map values to additionalProperties", () => {
    expect(avroToJsonSchema({ type: "map", values: "long" })).toEqual({
      type: "object",
      additionalProperties: {
        type: "integer",
        minimum: -(2 ** 63),
        maximum: 2 ** 63 - 1,
      },
    });
  });

  it("maps array items and passes array attributes through", () => {
    expect(
      avroToJsonSchema({
        type: "array",
        items: "string",
        minItems: 1,
        maxItems: 5,
        uniqueItems: true,
      } as AvroSchema),
    ).toEqual({
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 5,
      uniqueItems: true,
    });
  });

  it("maps string logicalType to format", () => {
    expect(
      avroToJsonSchema({ type: "string", logicalType: "uuid" }),
    ).toEqual({ type: "string", format: "uuid" });
  });

  describe("records", () => {
    it("converts fields, doc, default, and derives required", () => {
      const result = avroToJsonSchema({
        type: "record",
        name: "Person",
        namespace: "com.example",
        doc: "A person",
        fields: [
          { name: "name", type: "string", doc: "Full name" },
          { name: "age", type: "int", default: -1 },
          { name: "email", type: ["null", "string"], default: null },
        ],
      });

      expect(result.type).toBe("object");
      expect(result.description).toBe("A person");
      // age has a default and email is a nullable union — only name is required.
      expect(result.required).toEqual(["name"]);
      expect(result.properties?.name).toEqual({
        type: "string",
        description: "Full name",
      });
      expect(result.properties?.age).toMatchObject({
        type: "integer",
        default: -1,
      });
    });

    it("puts the null alternative last in nullable unions", () => {
      const result = avroToJsonSchema({
        type: "record",
        name: "Rec",
        fields: [{ name: "maybe", type: ["null", "string"] }],
      });

      expect(result.properties?.maybe.oneOf).toEqual([
        { type: "string" },
        { type: "null" },
      ]);
    });

    it("coerces field examples for int fields", () => {
      const result = avroToJsonSchema({
        type: "record",
        name: "Rec",
        fields: [{ name: "count", type: "int", example: "3" }],
      });

      expect(result.properties?.count.examples).toEqual([3]);
    });

    it("preserves boolean examples as booleans", () => {
      const result = avroToJsonSchema({
        type: "record",
        name: "Rec",
        fields: [
          { name: "flag", type: "boolean", example: true },
          { name: "flagStr", type: "boolean", example: "true" },
        ],
      });

      expect(result.properties?.flag.examples).toEqual([true]);
      expect(result.properties?.flagStr.examples).toEqual([true]);
    });

    it("does not leak reference-site doc onto the cached record", () => {
      const result = avroToJsonSchema({
        type: "record",
        name: "Outer",
        fields: [
          {
            name: "first",
            type: {
              type: "record",
              name: "MyRecord",
              doc: "original doc",
              fields: [{ name: "x", type: "int" }],
            },
          },
          {
            name: "second",
            type: [{ type: "MyRecord", doc: "union doc" }, "null"],
          },
        ],
      });

      expect(result.properties?.first.description).toBe("original doc");
      expect(result.properties?.second.oneOf?.[0]?.description).toBe("union doc");
    });

    it("applies field-level default/doc on named-type references", () => {
      const result = avroToJsonSchema({
        type: "record",
        name: "Outer",
        fields: [
          {
            name: "first",
            type: {
              type: "record",
              name: "Sub",
              fields: [{ name: "a", type: "string" }],
            },
          },
          {
            name: "second",
            type: "Sub",
            default: {},
            doc: "second field doc",
          },
        ],
      });

      expect(result.required).toEqual(["first"]);
      expect(result.properties?.second.description).toBe("second field doc");
      expect(result.properties?.second.default).toEqual({});
      // Defining site is unchanged.
      expect(result.properties?.first.description).toBeUndefined();
      expect(result.properties?.first.default).toBeUndefined();
    });

    it("resolves sibling named-type references and marks reuse with x-parser-schema-id", () => {
      const result = avroToJsonSchema({
        type: "record",
        name: "Trip",
        namespace: "com.example",
        fields: [
          {
            name: "start",
            type: {
              type: "record",
              name: "Point",
              namespace: "com.example",
              fields: [
                { name: "lat", type: "double" },
                { name: "lon", type: "double" },
              ],
            },
          },
          { name: "end", type: "com.example.Point" },
        ],
      });

      expect(result.properties?.end).toBe(result.properties?.start);
      expect(result.properties?.start["x-parser-schema-id"]).toBe(
        "com.example.Point",
      );
      expect(result.required).toEqual(["start", "end"]);
    });

    it("resolves named-type references inside arrays and unions", () => {
      const result = avroToJsonSchema({
        type: "record",
        name: "Route",
        namespace: "com.example",
        fields: [
          {
            name: "origin",
            type: {
              type: "record",
              name: "Point",
              namespace: "com.example",
              fields: [{ name: "lat", type: "double" }],
            },
          },
          {
            name: "waypoints",
            type: { type: "array", items: "com.example.Point" },
          },
          {
            name: "destination",
            type: ["null", "com.example.Point"],
            default: null,
          },
        ],
      });

      const origin = result.properties?.origin;
      expect((result.properties?.waypoints.items as { type?: string }).type).toBe(
        "object",
      );
      expect(result.properties?.waypoints.items).toBe(origin);
      expect(result.properties?.destination.oneOf?.[0]).toBe(origin);
    });

    it("terminates on self-referencing records without creating cycles", () => {
      const result = avroToJsonSchema({
        type: "record",
        name: "Node",
        fields: [
          { name: "value", type: "string" },
          { name: "next", type: "Node" },
        ],
      });

      // The self-reference cannot resolve while the record is still being
      // built — it renders as an untyped leaf, and the output stays acyclic.
      expect(result.properties?.next.type).toBeUndefined();
      expect(() => JSON.stringify(result)).not.toThrow();
    });
  });

  it("converts top-level unions to oneOf with null last", () => {
    const result = avroToJsonSchema([
      "null",
      {
        type: "record",
        name: "Payload",
        fields: [{ name: "id", type: "string" }],
      },
    ]);

    expect(result.oneOf).toHaveLength(2);
    expect(result.oneOf?.[0].type).toBe("object");
    expect(result.oneOf?.[1]).toEqual({ type: "null" });
  });

  it("converts a realistic nested schema (golden)", () => {
    const result = avroToJsonSchema({
      type: "record",
      name: "LightMeasured",
      namespace: "com.smartylighting",
      doc: "Light intensity measurement for a streetlight.",
      fields: [
        { name: "streetlightId", type: "string", doc: "Id of the streetlight." },
        { name: "lumens", type: "int", doc: "Lumens.", example: "3" },
        {
          name: "status",
          type: {
            type: "enum",
            name: "Status",
            namespace: "com.smartylighting",
            symbols: ["ON", "OFF", "FAULT"],
          },
        },
        {
          name: "location",
          type: {
            type: "record",
            name: "Location",
            namespace: "com.smartylighting",
            fields: [
              { name: "lat", type: "double" },
              { name: "lon", type: "double" },
            ],
          },
        },
        {
          name: "previousLocation",
          type: ["null", "com.smartylighting.Location"],
          default: null,
        },
        {
          name: "correlationId",
          type: { type: "string", logicalType: "uuid" },
        },
      ],
    });

    expect(result).toMatchSnapshot();
  });
});
