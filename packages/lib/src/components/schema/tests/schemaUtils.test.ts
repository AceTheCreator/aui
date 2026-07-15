import { describe, expect, it } from "vitest";
import {
  flattenAllOf,
  getAdditionalItemsSchema,
  getAllOfConditionals,
  getAnyOfItems,
  getContainsSchema,
  getItemSchema,
  getNotSchema,
  getOneOfItems,
  getTupleItemSchemas,
  hasAllOfConditionals,
  hasConstraints,
  hasExpandableContent,
  hasStructuralShape,
  isLeafItemSchema,
  mergeDescriptions,
  mergeSchemaObjects,
  normalizeSchema,
  refNameFromPath,
} from "../schemaUtils";
import { SchemaNodeData } from "../../../types/schema";

/** Minimal JSON Pointer deref over a plain object, mirroring the renderer's. */
const makeDeref =
  (doc: Record<string, unknown>) =>
  (ref: string): unknown =>
    ref
      .replace(/^#\//, "")
      .split("/")
      .reduce<unknown>(
        (acc, key) =>
          acc && typeof acc === "object"
            ? (acc as Record<string, unknown>)[key]
            : undefined,
        doc,
      );

const noDeref = () => undefined;

describe("refNameFromPath", () => {
  it("extracts the last segment of a JSON Pointer", () => {
    expect(refNameFromPath("#/components/schemas/sentAt")).toBe("sentAt");
  });

  it("returns single-segment refs unchanged", () => {
    expect(refNameFromPath("#/sentAt")).toBe("sentAt");
  });
});

describe("normalizeSchema", () => {
  it("passes schemas without $ref through untouched", () => {
    const schema: SchemaNodeData = { type: "string" };
    const result = normalizeSchema(schema, noDeref, new Set());

    expect(result.schema).toBe(schema);
    expect(result.refLabel).toBeUndefined();
    expect(result.circular).toBeUndefined();
  });

  it("resolves a $ref via deref and labels it with the ref name", () => {
    const doc = {
      components: { schemas: { sentAt: { type: "string", format: "date-time" } } },
    };
    const result = normalizeSchema(
      { $ref: "#/components/schemas/sentAt" },
      makeDeref(doc),
      new Set(),
    );

    expect(result.schema).toMatchObject({ type: "string", format: "date-time" });
    expect(result.refLabel).toBe("sentAt");
    expect(result.circular).toBeUndefined();
  });

  it("follows chained refs to the terminal schema", () => {
    const doc = {
      components: {
        schemas: {
          outer: { $ref: "#/components/schemas/inner" },
          inner: { type: "integer" },
        },
      },
    };
    const result = normalizeSchema(
      { $ref: "#/components/schemas/outer" },
      makeDeref(doc),
      new Set(),
    );

    expect(result.schema).toMatchObject({ type: "integer" });
    expect(result.refLabel).toBe("outer");
  });

  it("flags circular refs instead of recursing forever", () => {
    const doc: Record<string, unknown> = {
      components: {
        schemas: { node: { $ref: "#/components/schemas/node" } },
      },
    };
    const result = normalizeSchema(
      { $ref: "#/components/schemas/node" },
      makeDeref(doc),
      new Set(),
    );

    expect(result.circular).toBe(true);
  });

  it("keeps the raw ref (with label) when deref cannot resolve it", () => {
    const raw: SchemaNodeData = { $ref: "#/components/schemas/missing" };
    const result = normalizeSchema(raw, noDeref, new Set());

    expect(result.schema).toBe(raw);
    expect(result.refLabel).toBe("missing");
  });

  it("converts an Avro multi-format wrapper behind a $ref", () => {
    const doc = {
      components: {
        schemas: {
          lightMeasured: {
            schemaFormat: "application/vnd.apache.avro;version=1.9.0",
            schema: {
              type: "record",
              name: "LightMeasured",
              fields: [{ name: "lumens", type: "int" }],
            },
          },
        },
      },
    };
    const result = normalizeSchema(
      { $ref: "#/components/schemas/lightMeasured" },
      makeDeref(doc),
      new Set(),
    );

    expect(result.refLabel).toBe("lightMeasured");
    expect(result.schema.type).toBe("object");
    expect(result.schema.properties).toHaveProperty("lumens");
  });
});

describe("array item helpers", () => {
  it("getItemSchema returns the single item schema", () => {
    expect(getItemSchema({ items: { type: "string" } })).toEqual({
      type: "string",
    });
  });

  it("getItemSchema returns the first item of a tuple", () => {
    expect(
      getItemSchema({ items: [{ type: "string" }, { type: "number" }] }),
    ).toEqual({ type: "string" });
  });

  it("getItemSchema returns null when items is absent or not a record", () => {
    expect(getItemSchema({})).toBeNull();
    expect(getItemSchema({ items: [] })).toBeNull();
  });

  it("getTupleItemSchemas returns all positional schemas only in tuple mode", () => {
    expect(
      getTupleItemSchemas({ items: [{ type: "string" }, { type: "number" }] }),
    ).toEqual([{ type: "string" }, { type: "number" }]);
    expect(getTupleItemSchemas({ items: { type: "string" } })).toBeNull();
    expect(getTupleItemSchemas({ items: [] })).toBeNull();
  });

  it("getAdditionalItemsSchema only applies in tuple mode", () => {
    expect(
      getAdditionalItemsSchema({
        items: [{ type: "string" }],
        additionalItems: { type: "number" },
      }),
    ).toEqual({ type: "number" });
    expect(
      getAdditionalItemsSchema({
        items: [{ type: "string" }],
        additionalItems: false,
      }),
    ).toBe(false);
    expect(
      getAdditionalItemsSchema({
        items: { type: "string" },
        additionalItems: { type: "number" },
      }),
    ).toBeNull();
  });

  it("getContainsSchema handles object, boolean, and absent forms", () => {
    expect(getContainsSchema({ contains: { type: "number" } })).toEqual({
      type: "number",
    });
    expect(getContainsSchema({ contains: false })).toBe(false);
    expect(getContainsSchema({})).toBeNull();
  });
});

describe("mergeDescriptions", () => {
  it("returns undefined when both sides are empty", () => {
    expect(mergeDescriptions(undefined, undefined)).toBeUndefined();
  });

  it("returns whichever side is present", () => {
    expect(mergeDescriptions("array", undefined)).toBe("array");
    expect(mergeDescriptions(undefined, "item")).toBe("item");
  });

  it("deduplicates identical descriptions", () => {
    expect(mergeDescriptions("same", "same")).toBe("same");
  });

  it("joins differing descriptions with a blank line", () => {
    expect(mergeDescriptions("array", "item")).toBe("array\n\nitem");
  });
});

describe("mergeSchemaObjects", () => {
  it("unions required and deep-merges shared properties", () => {
    const merged = mergeSchemaObjects(
      {
        required: ["id"],
        properties: { id: { type: "string" }, meta: { type: "object" } },
      },
      {
        required: ["name"],
        properties: {
          name: { type: "string" },
          meta: { description: "extra" },
        },
      },
      noDeref,
      new Set(),
    );

    expect(merged.required).toEqual(["id", "name"]);
    expect(Object.keys(merged.properties!)).toEqual(["id", "meta", "name"]);
    expect(merged.properties!.meta).toMatchObject({
      type: "object",
      description: "extra",
    });
  });

  it("lets later scalar values win on conflicts", () => {
    const merged = mergeSchemaObjects(
      { type: "string", minLength: 1 },
      { type: "integer" },
      noDeref,
      new Set(),
    );

    expect(merged.type).toBe("integer");
    expect(merged.minLength).toBe(1);
  });

  it("merges tuple items element-wise, taking the later tuple's length", () => {
    const merged = mergeSchemaObjects(
      { items: [{ type: "string" }, { type: "number" }] },
      { items: [{ minLength: 2 }, { maximum: 10 }] },
      noDeref,
      new Set(),
    );

    expect(merged.items).toEqual([
      { type: "string", minLength: 2 },
      { type: "number", maximum: 10 },
    ]);

    // Slots beyond the later tuple's length are dropped — b's shape wins.
    const truncated = mergeSchemaObjects(
      { items: [{ type: "string" }, { type: "number" }] },
      { items: [{ minLength: 2 }] },
      noDeref,
      new Set(),
    );
    expect(truncated.items).toEqual([{ type: "string", minLength: 2 }]);
  });
});

describe("flattenAllOf", () => {
  it("merges allOf members and drops the allOf key", () => {
    const flattened = flattenAllOf(
      {
        allOf: [
          { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
          { properties: { name: { type: "string" } }, required: ["name"] },
        ],
      },
      noDeref,
      new Set(),
    );

    expect(flattened.allOf).toBeUndefined();
    expect(flattened.type).toBe("object");
    expect(Object.keys(flattened.properties!)).toEqual(["id", "name"]);
    expect(flattened.required).toEqual(["id", "name"]);
  });

  it("resolves $refs among allOf members", () => {
    const doc = {
      components: {
        schemas: { base: { properties: { id: { type: "string" } } } },
      },
    };
    const flattened = flattenAllOf(
      {
        allOf: [
          { $ref: "#/components/schemas/base" },
          { properties: { name: { type: "string" } } },
        ],
      },
      makeDeref(doc),
      new Set(),
    );

    expect(Object.keys(flattened.properties!)).toEqual(["id", "name"]);
  });

  it("merges sibling keys alongside allOf", () => {
    const flattened = flattenAllOf(
      {
        allOf: [{ properties: { id: { type: "string" } } }],
        description: "sibling wins",
      },
      noDeref,
      new Set(),
    );

    expect(flattened.description).toBe("sibling wins");
    expect(flattened.properties).toHaveProperty("id");
  });

  it("promotes a single collected if/then/else back onto the result", () => {
    const flattened = flattenAllOf(
      {
        allOf: [
          {
            if: { properties: { kind: { const: "a" } } },
            then: { required: ["aField"] },
          },
          { type: "object" },
        ],
      },
      noDeref,
      new Set(),
    );

    expect(flattened.if).toEqual({ properties: { kind: { const: "a" } } });
    expect(flattened.then).toEqual({ required: ["aField"] });
    expect(hasAllOfConditionals(flattened)).toBe(false);
  });

  it("stores multiple conditionals under _allOfConditionals", () => {
    const flattened = flattenAllOf(
      {
        allOf: [
          { if: { const: 1 }, then: { title: "one" } },
          { if: { const: 2 }, else: { title: "not two" } },
        ],
      },
      noDeref,
      new Set(),
    );

    expect(hasAllOfConditionals(flattened)).toBe(true);
    const conditionals = getAllOfConditionals(flattened);
    expect(conditionals).toHaveLength(2);
    expect(conditionals[0]).toEqual({ if: { const: 1 }, then: { title: "one" } });
    expect(conditionals[1]).toEqual({
      if: { const: 2 },
      else: { title: "not two" },
    });
  });

  it("skips circular allOf members without throwing", () => {
    const doc: Record<string, unknown> = {
      components: {
        schemas: {
          node: {
            allOf: [{ $ref: "#/components/schemas/node" }],
            properties: { id: { type: "string" } },
          },
        },
      },
    };
    const deref = makeDeref(doc);
    const flattened = normalizeSchema(
      { $ref: "#/components/schemas/node" },
      deref,
      new Set(),
    );

    expect(() =>
      flattenAllOf(flattened.schema, deref, new Set(["#/components/schemas/node"])),
    ).not.toThrow();
  });

  it("flattens allOf nested inside properties and items", () => {
    const flattened = flattenAllOf(
      {
        properties: {
          meta: { allOf: [{ type: "object" }, { properties: { v: { type: "integer" } } }] },
        },
        items: { allOf: [{ type: "string" }, { minLength: 1 }] },
      },
      noDeref,
      new Set(),
    );

    expect(flattened.properties!.meta).toMatchObject({ type: "object" });
    expect(flattened.properties!.meta.properties).toHaveProperty("v");
    expect(flattened.items).toMatchObject({ type: "string", minLength: 1 });
  });
});

describe("composition helpers", () => {
  it("getOneOfItems / getAnyOfItems filter to schema records", () => {
    expect(getOneOfItems({ oneOf: [{ type: "string" }, "junk" as never] })).toEqual([
      { type: "string" },
    ]);
    expect(getOneOfItems({ oneOf: [] })).toBeNull();
    expect(getAnyOfItems({ anyOf: [{ type: "number" }] })).toEqual([
      { type: "number" },
    ]);
    expect(getAnyOfItems({})).toBeNull();
  });

  it("getNotSchema handles object, boolean, and absent forms", () => {
    expect(getNotSchema({ not: { type: "string" } })).toEqual({ type: "string" });
    expect(getNotSchema({ not: true })).toBe(true);
    expect(getNotSchema({})).toBeNull();
  });
});

describe("shape predicates", () => {
  it("isLeafItemSchema is true only for scalar-like schemas", () => {
    expect(isLeafItemSchema({ type: "string", format: "email" })).toBe(true);
    expect(isLeafItemSchema({ type: "object" })).toBe(false);
    expect(isLeafItemSchema({ properties: { id: {} } })).toBe(false);
    expect(isLeafItemSchema({ items: { type: "string" } })).toBe(false);
    expect(isLeafItemSchema({ oneOf: [{ type: "string" }] })).toBe(false);
    expect(isLeafItemSchema({ not: { type: "null" } })).toBe(false);
  });

  it("hasStructuralShape detects renderable structure", () => {
    expect(hasStructuralShape({ type: "string" })).toBe(true);
    expect(hasStructuralShape({ properties: { id: {} } })).toBe(true);
    expect(hasStructuralShape({ oneOf: [{ type: "string" }] })).toBe(true);
    expect(hasStructuralShape({})).toBe(false);
  });

  it("hasConstraints checks the schema and falls back to the item schema", () => {
    expect(hasConstraints({ minLength: 1 })).toBe(true);
    expect(hasConstraints({ enum: ["a"] })).toBe(true);
    expect(hasConstraints({ type: "string" })).toBe(false);
    expect(hasConstraints({ type: "array" }, { minimum: 0 })).toBe(true);
    expect(hasConstraints({ type: "array" }, { type: "number" })).toBe(false);
  });

  it("hasExpandableContent is false for scalars, true for structured schemas", () => {
    expect(hasExpandableContent({ type: "string" })).toBe(false);
    expect(hasExpandableContent({ properties: { id: {} } })).toBe(true);
    expect(hasExpandableContent({ if: { const: 1 }, then: {} })).toBe(true);
  });

  it("hasExpandableContent treats arrays of leaves as non-expandable", () => {
    expect(hasExpandableContent({ type: "array", items: { type: "string" } })).toBe(
      false,
    );
    expect(
      hasExpandableContent({
        type: "array",
        items: { type: "object", properties: { id: {} } },
      }),
    ).toBe(true);
  });

  it("hasExpandableContent resolves $ref array items through deref", () => {
    const doc = {
      components: {
        schemas: {
          leaf: { type: "string" },
          branch: { type: "object", properties: { id: { type: "string" } } },
        },
      },
    };
    const deref = makeDeref(doc);

    expect(
      hasExpandableContent(
        { type: "array", items: { $ref: "#/components/schemas/leaf" } },
        deref,
      ),
    ).toBe(false);
    expect(
      hasExpandableContent(
        { type: "array", items: { $ref: "#/components/schemas/branch" } },
        deref,
      ),
    ).toBe(true);
  });
});
