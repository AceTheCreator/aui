import { asSchemaNode, isSchemaRecord, SchemaNodeData } from "../../types/schema";
import { buildTypeDisplay } from "./schemaDisplayUtils";

/** Extracts the schema name from a JSON Pointer, e.g. "#/components/schemas/sentAt" → "sentAt". */
export const refNameFromPath = (ref: string) =>
  ref.replace(/^#\//, "").split("/").pop() ?? ref;

export interface NormalizedSchema {
  schema: SchemaNodeData;
  refLabel?: string;
  circular?: boolean;
}

/** Resolves $ref inline via deref; refStack tracks the active chain to detect circular refs. */
export const normalizeSchema = (
  raw: SchemaNodeData,
  deref: (ref: string) => unknown,
  refStack: Set<string>
): NormalizedSchema => {
  if (!raw.$ref) return { schema: raw };

  const ref = raw.$ref;
  const refLabel = refNameFromPath(ref);

  if (refStack.has(ref)) {
    return { schema: raw, refLabel, circular: true };
  }

  const resolved = asSchemaNode(deref(ref));
  if (!resolved) return { schema: raw, refLabel };

  refStack.add(ref);
  const inner = normalizeSchema(resolved, deref, refStack);
  refStack.delete(ref);

  return {
    schema: inner.schema,
    refLabel: inner.circular ? undefined : refLabel,
    circular: inner.circular,
  };
};

/** Returns the first item schema from an array definition, if any. */
export const getItemSchema = (
  schema: SchemaNodeData
): SchemaNodeData | null => {
  const items = schema.items;
  const item = Array.isArray(items) ? items[0] : items;
  return isSchemaRecord(item) ? item : null;
};

/** Combines array- and item-level descriptions when they differ. */
export const mergeDescriptions = (
  arrayDescription?: string,
  itemDescription?: string
): string | undefined => {
  if (!arrayDescription && !itemDescription) return undefined;
  if (!itemDescription || arrayDescription === itemDescription) {
    return arrayDescription ?? itemDescription;
  }
  if (!arrayDescription) return itemDescription;
  return `${arrayDescription}\n\n${itemDescription}`;
};

const MERGE_SKIP_KEYS = new Set([
  "allOf",
  "oneOf",
  "anyOf",
  "not",
  "$ref",
  "properties",
  "required",
  "description",
  "items",
]);

/** Merges two schema records for display; later values win on scalar conflicts. */
export const mergeSchemaObjects = (
  a: SchemaNodeData,
  b: SchemaNodeData,
  deref: (ref: string) => unknown,
  refStack: Set<string>
): SchemaNodeData => {
  const result: SchemaNodeData = { ...a };

  if (b.description) {
    result.description = mergeDescriptions(
      typeof result.description === "string" ? result.description : undefined,
      typeof b.description === "string" ? b.description : undefined
    );
  }

  if (b.required) {
    result.required = Array.from(
      new Set([...(result.required ?? []), ...b.required])
    );
  }

  if (b.properties) {
    result.properties = { ...(result.properties ?? {}) };
    for (const [key, prop] of Object.entries(b.properties)) {
      if (!isSchemaRecord(prop)) continue;
      const existing = result.properties[key];
      if (isSchemaRecord(existing)) {
        result.properties[key] = mergeSchemaObjects(existing, prop, deref, refStack);
      } else {
        result.properties[key] = prop;
      }
    }
  }

  if (b.items) {
    const bItem = getItemSchema(b);
    const aItem = getItemSchema(result);
    if (bItem && aItem) {
      result.items = mergeSchemaObjects(aItem, bItem, deref, refStack);
    } else if (bItem) {
      result.items = b.items;
    }
  }

  for (const [key, value] of Object.entries(b)) {
    if (MERGE_SKIP_KEYS.has(key) || value === undefined) continue;
    result[key] = value;
  }

  return result;
};

/** Recursively flattens nested properties/items that contain allOf. */
const flattenAllOfNested = (
  schema: SchemaNodeData,
  deref: (ref: string) => unknown,
  refStack: Set<string>
): SchemaNodeData => {
  const result: SchemaNodeData = { ...schema };
  delete result.allOf;

  if (result.properties) {
    result.properties = Object.fromEntries(
      Object.entries(result.properties).map(([key, prop]) =>
        isSchemaRecord(prop)
          ? [key, flattenAllOf(prop, deref, refStack)]
          : [key, prop]
      )
    );
  }

  const itemSchema = getItemSchema(result);
  if (itemSchema) {
    result.items = flattenAllOf(itemSchema, deref, refStack);
  }

  return result;
};

/** Merges allOf subschemas into one; no allOf key in the result. */
export const flattenAllOf = (
  schema: SchemaNodeData,
  deref: (ref: string) => unknown,
  refStack: Set<string>
): SchemaNodeData => {
  const allOfItems = schema.allOf;
  if (Array.isArray(allOfItems) && allOfItems.length > 0) {
    let merged: SchemaNodeData = {};
    for (const item of allOfItems) {
      if (!isSchemaRecord(item)) continue;
      const { schema: normalized, circular } = normalizeSchema(item, deref, refStack);
      if (circular) continue;
      const flattened = flattenAllOf(normalized, deref, refStack);
      merged = mergeSchemaObjects(merged, flattened, deref, refStack);
    }

    const siblings = { ...schema };
    delete siblings.allOf;
    const withSiblings =
      Object.keys(siblings).length > 0
        ? mergeSchemaObjects(merged, siblings as SchemaNodeData, deref, refStack)
        : merged;

    return flattenAllOfNested(withSiblings, deref, refStack);
  }

  return flattenAllOfNested(schema, deref, refStack);
};

/** Returns oneOf subschemas when present. */
export const getOneOfItems = (schema: SchemaNodeData): SchemaNodeData[] | null => {
  const items = schema.oneOf;
  if (!Array.isArray(items) || items.length === 0) return null;
  const filtered = items.filter((item): item is SchemaNodeData => isSchemaRecord(item));
  return filtered.length > 0 ? filtered : null;
};

/** Returns anyOf subschemas when present. */
export const getAnyOfItems = (schema: SchemaNodeData): SchemaNodeData[] | null => {
  const items = schema.anyOf;
  if (!Array.isArray(items) || items.length === 0) return null;
  const filtered = items.filter((item): item is SchemaNodeData => isSchemaRecord(item));
  return filtered.length > 0 ? filtered : null;
};

/** Returns the not subschema when present. */
export const getNotSchema = (
  schema: SchemaNodeData
): SchemaNodeData | boolean | null => {
  if (schema.not === undefined) return null;
  if (typeof schema.not === "boolean") return schema.not;
  if (isSchemaRecord(schema.not)) return schema.not as SchemaNodeData;
  return null;
};

/** Whether the schema defines a not keyword. */
export const hasNotSchema = (schema: SchemaNodeData): boolean =>
  getNotSchema(schema) !== null;

/** Returns a copy of the schema without not (for shape detection). */
export const omitNot = (schema: SchemaNodeData): SchemaNodeData => {
  const { not: _not, ...rest } = schema;
  return rest;
};

/** True when the schema has a renderable shape besides not. */
export const hasStructuralShape = (schema: SchemaNodeData): boolean => {
  if (getOneOfItems(schema)) return true;
  if (getAnyOfItems(schema)) return true;
  if (schema.properties && Object.keys(schema.properties).length > 0) return true;
  if (schema.type === "array" || schema.items) return true;
  if (schema.type !== undefined) return true;
  return false;
};

/** True when a schema has no nested structure worth expanding. */
export const isLeafItemSchema = (schema: SchemaNodeData): boolean => {
  if (hasNotSchema(schema)) return false;
  if (getOneOfItems(schema)) return false;
  if (getAnyOfItems(schema)) return false;
  if (schema.properties && Object.keys(schema.properties).length > 0) return false;
  if (schema.items) return false;
  if (schema.type === "array" || schema.type === "object") return false;
  return true;
};

function schemaHasConstraints(schema: SchemaNodeData): boolean {
  return (
    typeof schema.multipleOf === "number" ||
    typeof schema.minimum === "number" ||
    typeof schema.exclusiveMinimum === "number" ||
    typeof schema.maximum === "number" ||
    typeof schema.exclusiveMaximum === "number" ||
    typeof schema.minLength === "number" ||
    typeof schema.maxLength === "number" ||
    typeof schema.minItems === "number" ||
    typeof schema.maxItems === "number" ||
    typeof schema.minProperties === "number" ||
    typeof schema.maxProperties === "number" ||
    (typeof schema.pattern === "string" && schema.pattern.length > 0) ||
    (Array.isArray(schema.enum) && schema.enum.length > 0) ||
    schema.const !== undefined ||
    schema.uniqueItems === true
  );
}

/** Whether a schema (and optional array item schema) has constraints to show. */
export const hasConstraints = (
  schema: SchemaNodeData,
  itemSchema?: SchemaNodeData | null
): boolean => {
  if (schemaHasConstraints(schema)) return true;
  if (itemSchema && isLeafItemSchema(itemSchema)) {
    return schemaHasConstraints(itemSchema);
  }
  return false;
};

/** Builds the human-readable type string shown on the right side of each row. */
export const getTypeLabel = (schema: SchemaNodeData, refLabel?: string): string => {
  const { text, format, refHint } = buildTypeDisplay(schema, refLabel);
  let label = text;
  if (format) label += `, ${format}`;
  if (refHint) label += `, (${refHint})`;
  return label;
};

/** Whether a schema node has children worth showing behind an expand toggle. */
export const hasExpandableContent = (
  schema: SchemaNodeData,
  deref?: (ref: string) => unknown
): boolean => {
  if (hasNotSchema(schema)) return true;
  if (getOneOfItems(schema)) return true;
  if (getAnyOfItems(schema)) return true;
  if (schema.properties && Object.keys(schema.properties).length > 0) return true;
  if (schema.type === "array" || schema.items) {
    const itemSchema = getItemSchema(schema);
    if (!itemSchema) return false;
    if (itemSchema.$ref && deref) {
      const { schema: resolved } = normalizeSchema(itemSchema, deref, new Set());
      const flattened = flattenAllOf(resolved, deref, new Set());
      return !isLeafItemSchema(flattened);
    }
    return !isLeafItemSchema(itemSchema);
  }
  return false;
};
