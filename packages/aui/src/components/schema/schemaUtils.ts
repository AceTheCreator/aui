import { asSchemaNode, isSchemaRecord, SchemaNodeData } from "../../types/schema";
import { resolveSchemaInput } from "../../helpers/schemaFormat";

const EMPTY_REF_STACK = new Set<string>();

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

  // Multi-format wrappers (Avro, etc.) behind $ref are not unwrapped by
  // resolveSchemaInput at the payload root — convert them here after deref.
  const { schema: unwrapped } = resolveSchemaInput(resolved);

  refStack.add(ref);
  try {
    const inner = normalizeSchema(unwrapped, deref, refStack);
    return {
      schema: inner.schema,
      refLabel: inner.circular ? undefined : refLabel,
      circular: inner.circular,
    };
  } finally {
    refStack.delete(ref);
  }
};

/** Returns the first item schema from an array definition, if any. */
export const getItemSchema = (
  schema: SchemaNodeData
): SchemaNodeData | null => {
  const items = schema.items;
  const item = Array.isArray(items) ? items[0] : items;
  return isSchemaRecord(item) ? item : null;
};

/** Returns all positional item schemas when items is an array (tuple mode). */
export const getTupleItemSchemas = (
  schema: SchemaNodeData
): SchemaNodeData[] | null => {
  const items = schema.items;
  if (!Array.isArray(items) || items.length === 0) return null;
  const result = items.filter((item): item is SchemaNodeData => isSchemaRecord(item));
  return result.length > 0 ? result : null;
};

/** Returns additionalItems subschema when in tuple mode (items is an array). */
export const getAdditionalItemsSchema = (
  schema: SchemaNodeData
): SchemaNodeData | boolean | null => {
  if (!Array.isArray(schema.items)) return null;
  if (schema.additionalItems === undefined) return null;
  if (typeof schema.additionalItems === "boolean") return schema.additionalItems;
  if (isSchemaRecord(schema.additionalItems)) return schema.additionalItems as SchemaNodeData;
  return null;
};

/**
 * Returns the contains subschema (or boolean) when present.
 * JSON Schema allows contains:true (any item satisfies), contains:false (impossible),
 * or an object schema. Absent means no constraint.
 */
export const getContainsSchema = (
  schema: SchemaNodeData
): SchemaNodeData | boolean | null => {
  if (schema.contains === undefined) return null;
  if (typeof schema.contains === "boolean") return schema.contains;
  if (isSchemaRecord(schema.contains)) return schema.contains as SchemaNodeData;
  return null;
};

/** Whether the schema defines a contains keyword. */
export const hasContains = (schema: SchemaNodeData): boolean =>
  schema.contains !== undefined;

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

// Keys excluded from the generic scalar-copy loop in mergeSchemaObjects:
// structural keys are handled by dedicated merge logic above the loop;
// composition/conditional keys are either pre-flattened (allOf) or collected
// separately (_allOfConditionals, if/then/else) and must not be blindly overwritten.
const MERGE_SKIP_KEYS = new Set([
  "allOf",
  "oneOf",
  "anyOf",
  "not",
  "if",
  "then",
  "else",
  "_allOfConditionals",
  "$ref",
  "properties",
  "patternProperties",
  "propertyNames",
  "additionalProperties",
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
    if (Array.isArray(b.items)) {
      // Tuple mode: preserve all positional schemas. b's tuple wins over a scalar a.items;
      // if a is also a tuple, merge element-wise so shared slots pick up both schemas' keywords.
      if (Array.isArray(result.items)) {
        result.items = b.items.map((bSlot, i) => {
          const aSlot = (result.items as SchemaNodeData[])[i];
          return isSchemaRecord(bSlot) && isSchemaRecord(aSlot)
            ? mergeSchemaObjects(aSlot as SchemaNodeData, bSlot as SchemaNodeData, deref, refStack)
            : (isSchemaRecord(bSlot) ? bSlot as SchemaNodeData : aSlot);
        });
      } else {
        result.items = b.items;
      }
    } else {
      const bItem = getItemSchema(b);
      const aItem = getItemSchema(result);
      if (bItem && aItem) {
        result.items = mergeSchemaObjects(aItem, bItem, deref, refStack);
      } else if (bItem) {
        result.items = b.items;
      }
    }
  }

  if (b.patternProperties && isSchemaRecord(b.patternProperties)) {
    const mergedPatternProperties: Record<string, unknown> = {
      ...(isSchemaRecord(result.patternProperties)
        ? result.patternProperties
        : {}),
    };
    for (const [key, prop] of Object.entries(b.patternProperties)) {
      if (!isSchemaRecord(prop)) {
        mergedPatternProperties[key] = prop;
        continue;
      }
      const existing = mergedPatternProperties[key];
      if (isSchemaRecord(existing)) {
        mergedPatternProperties[key] = mergeSchemaObjects(
          existing,
          prop,
          deref,
          refStack
        );
      } else {
        mergedPatternProperties[key] = prop;
      }
    }
    result.patternProperties = mergedPatternProperties;
  }

  if (b.propertyNames !== undefined) {
    if (isSchemaRecord(b.propertyNames)) {
      const existing = result.propertyNames;
      result.propertyNames = isSchemaRecord(existing)
        ? mergeSchemaObjects(existing, b.propertyNames, deref, refStack)
        : b.propertyNames;
    } else {
      result.propertyNames = b.propertyNames;
    }
  }

  if (b.additionalProperties !== undefined) {
    if (isSchemaRecord(b.additionalProperties)) {
      const existing = result.additionalProperties;
      result.additionalProperties = isSchemaRecord(existing)
        ? mergeSchemaObjects(existing, b.additionalProperties, deref, refStack)
        : b.additionalProperties;
    } else {
      result.additionalProperties = b.additionalProperties;
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

  const propertyNames = getPropertyNamesSchema(result);
  if (propertyNames !== null && isSchemaRecord(propertyNames)) {
    result.propertyNames = flattenAllOf(propertyNames, deref, refStack);
  }

  const additionalProperties = getAdditionalPropertiesSchema(result);
  if (
    additionalProperties !== null &&
    isSchemaRecord(additionalProperties)
  ) {
    result.additionalProperties = flattenAllOf(
      additionalProperties,
      deref,
      refStack
    );
  }

  const patternEntries = getPatternPropertiesEntries(result);
  if (patternEntries.length > 0) {
    result.patternProperties = Object.fromEntries(
      patternEntries.map(([pattern, sub]) => [
        pattern,
        flattenAllOf(sub, deref, refStack),
      ])
    );
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
    const collectedConditionals: SchemaNodeData[] = [];
    let merged: SchemaNodeData = {};

    for (const item of allOfItems) {
      if (!isSchemaRecord(item)) continue;
      const { schema: normalized, circular } = normalizeSchema(item, deref, refStack);
      if (circular) continue;
      const flattened = flattenAllOf(normalized, deref, refStack);

      // Collect if/then/else before merging — mergeSchemaObjects drops them.
      if (flattened.if !== undefined) {
        const cond: SchemaNodeData = { if: flattened.if };
        if (flattened.then !== undefined) cond.then = flattened.then;
        if (flattened.else !== undefined) cond.else = flattened.else;
        collectedConditionals.push(cond);
      }
      collectedConditionals.push(...getAllOfConditionals(flattened));

      // MERGE_SKIP_KEYS already prevents _allOfConditionals from crossing over.
      merged = mergeSchemaObjects(merged, flattened, deref, refStack);
    }

    // Sibling if/then/else (alongside allOf on the same schema object) also gets
    // dropped by mergeSchemaObjects — collect it here.
    if (schema.if !== undefined) {
      const cond: SchemaNodeData = { if: schema.if };
      if (schema.then !== undefined) cond.then = schema.then;
      if (schema.else !== undefined) cond.else = schema.else;
      collectedConditionals.push(cond);
    }

    const siblings = { ...schema };
    delete siblings.allOf;
    const withSiblings =
      Object.keys(siblings).length > 0
        ? mergeSchemaObjects(merged, siblings as SchemaNodeData, deref, refStack)
        : merged;

    const result = flattenAllOfNested(withSiblings, deref, refStack);

    // Restore conditionals: single one → promote to if/then/else; multiple → store list.
    if (collectedConditionals.length === 1) {
      const cond = collectedConditionals[0]!;
      result.if = cond.if;
      if (cond.then !== undefined) result.then = cond.then;
      if (cond.else !== undefined) result.else = cond.else;
    } else if (collectedConditionals.length > 1) {
      // Synthetic key that carries multiple independent if/then/else branches collected
      // from allOf members. The _-prefix marks it as internal; MERGE_SKIP_KEYS ensures
      // mergeSchemaObjects never copies it across schemas.
      result._allOfConditionals = collectedConditionals;
    }

    return result;
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

/** Returns a copy of the schema without if/then/else (for shape detection). */
export const omitIfThenElse = (schema: SchemaNodeData): SchemaNodeData => {
  const { if: _if, then: _then, else: _else, ...rest } = schema;
  return rest;
};

/** Whether the schema defines an if keyword. */
export const hasIfThenElse = (schema: SchemaNodeData): boolean =>
  schema.if !== undefined;

/** Safely casts an unknown schema value to SchemaNodeData | boolean | null. */
export const getSubschema = (value: unknown): SchemaNodeData | boolean | null => {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (isSchemaRecord(value)) return value as SchemaNodeData;
  return null;
};

/** Returns _allOfConditionals set during allOf flattening. */
export const getAllOfConditionals = (schema: SchemaNodeData): SchemaNodeData[] => {
  if (!Array.isArray(schema._allOfConditionals)) return [];
  return (schema._allOfConditionals as unknown[]).filter(
    (item): item is SchemaNodeData => isSchemaRecord(item)
  );
};

/**
 * Whether the schema has additional conditionals from allOf flattening.
 * O(1) check — reads the array length directly rather than allocating a
 * filtered copy via getAllOfConditionals.
 */
export const hasAllOfConditionals = (schema: SchemaNodeData): boolean =>
  Array.isArray(schema._allOfConditionals) &&
  (schema._allOfConditionals as unknown[]).length > 0;

/** Returns the propertyNames subschema when present. */
export const getPropertyNamesSchema = (
  schema: SchemaNodeData
): SchemaNodeData | boolean | null => {
  if (schema.propertyNames === undefined) return null;
  if (typeof schema.propertyNames === "boolean") return schema.propertyNames;
  if (isSchemaRecord(schema.propertyNames)) {
    return schema.propertyNames as SchemaNodeData;
  }
  return null;
};

/** Returns the additionalProperties subschema when present. */
export const getAdditionalPropertiesSchema = (
  schema: SchemaNodeData
): SchemaNodeData | boolean | null => {
  if (schema.additionalProperties === undefined) return null;
  if (typeof schema.additionalProperties === "boolean") {
    return schema.additionalProperties;
  }
  if (isSchemaRecord(schema.additionalProperties)) {
    return schema.additionalProperties as SchemaNodeData;
  }
  return null;
};

/** Returns patternProperties entries whose values are schema objects. */
export const getPatternPropertiesEntries = (
  schema: SchemaNodeData
): [string, SchemaNodeData][] => {
  const patternProperties = schema.patternProperties;
  if (!isSchemaRecord(patternProperties)) return [];

  return Object.entries(patternProperties).flatMap(([pattern, value]) =>
    isSchemaRecord(value) ? [[pattern, value as SchemaNodeData]] : []
  );
};

/** Path segment for a patternProperties row. */
export const patternPropertyPath = (path: string, pattern: string): string =>
  `${path}.[pattern:${pattern}]`;

/** True when the schema defines explicit named properties. */
export const hasExplicitProperties = (schema: SchemaNodeData): boolean =>
  schema.properties !== undefined && Object.keys(schema.properties).length > 0;

/** True when map keywords yield tree rows (not boolean-only pills). */
export const hasObjectMapContent = (schema: SchemaNodeData): boolean => {
  const propertyNames = getPropertyNamesSchema(schema);
  if (propertyNames !== null && isSchemaRecord(propertyNames)) return true;

  const additionalProperties = getAdditionalPropertiesSchema(schema);
  if (
    additionalProperties !== null &&
    isSchemaRecord(additionalProperties)
  ) {
    return true;
  }

  return getPatternPropertiesEntries(schema).length > 0;
};

/** True when the schema has a renderable shape besides not. */
export const hasStructuralShape = (schema: SchemaNodeData): boolean => {
  if (getOneOfItems(schema)) return true;
  if (getAnyOfItems(schema)) return true;
  if (hasExplicitProperties(schema)) return true;
  if (hasObjectMapContent(schema)) return true;
  if (schema.type === "array" || schema.items) return true;
  if (schema.type !== undefined) return true;
  return false;
};

/** True when a schema has no nested structure worth expanding. */
export const isLeafItemSchema = (schema: SchemaNodeData): boolean => {
  if (hasNotSchema(schema)) return false;
  if (hasIfThenElse(schema)) return false;
  if (hasAllOfConditionals(schema)) return false;
  if (getOneOfItems(schema)) return false;
  if (getAnyOfItems(schema)) return false;
  if (hasExplicitProperties(schema)) return false;
  if (hasObjectMapContent(schema)) return false;
  if (schema.items) return false;
  if (hasContains(schema)) return false;
  if (schema.type === "array" || schema.type === "object") return false;
  return true;
};

function hasMapKeywordConstraints(schema: SchemaNodeData): boolean {
  const additionalProperties = getAdditionalPropertiesSchema(schema);
  if (typeof additionalProperties === "boolean") return true;

  const propertyNames = getPropertyNamesSchema(schema);
  if (typeof propertyNames === "boolean") return true;

  const leafPropertyNames =
    propertyNames !== null &&
    isSchemaRecord(propertyNames) &&
    isLeafItemSchema(propertyNames);
  if (
    leafPropertyNames &&
    typeof propertyNames.pattern === "string" &&
    propertyNames.pattern.length > 0
  ) {
    return true;
  }

  return false;
}

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
    schema.uniqueItems === true ||
    hasMapKeywordConstraints(schema)
  );
}

/** Whether a schema (and optional array item schema) has constraints to show. */
export const hasConstraints = (
  schema: SchemaNodeData,
  itemSchema?: SchemaNodeData | null
): boolean => {
  if (schemaHasConstraints(schema)) return true;
  if (itemSchema) return schemaHasConstraints(itemSchema);
  return false;
};

/** Whether a schema node has children worth showing behind an expand toggle. */
export const hasExpandableContent = (
  schema: SchemaNodeData,
  deref?: (ref: string) => unknown
): boolean => {
  if (hasNotSchema(schema)) return true;
  if (hasIfThenElse(schema)) return true;
  if (hasAllOfConditionals(schema)) return true;
  if (getOneOfItems(schema)) return true;
  if (getAnyOfItems(schema)) return true;
  if (hasExplicitProperties(schema)) return true;
  if (hasObjectMapContent(schema)) return true;
  if (schema.type === "array" || schema.items) {
    if (hasContains(schema)) return true;
    if (getTupleItemSchemas(schema) !== null) return true;
    const itemSchema = getItemSchema(schema);
    if (!itemSchema) return false;
    if (itemSchema.$ref && deref) {
      const { schema: resolved } = normalizeSchema(itemSchema, deref, EMPTY_REF_STACK);
      const flattened = flattenAllOf(resolved, deref, EMPTY_REF_STACK);
      return !isLeafItemSchema(flattened);
    }
    return !isLeafItemSchema(itemSchema);
  }
  return false;
};
