/**
 * Avro → JSON Schema conversion.
 *
 * Ported from @asyncapi/avro-schema-parser
 * (https://github.com/asyncapi/avro-schema-parser), Copyright the AsyncAPI
 * Initiative, licensed under Apache-2.0 — see THIRD_PARTY_NOTICES.md.
 *
 * Divergences from upstream:
 * - synchronous API (upstream is async but performs no I/O);
 * - `avsc`-based validation removed (see validateAvroStructure.ts);
 * - the record cache is threaded through array/map positions and consulted
 *   for named-type-reference strings there, so `"items": "com.x.Address"`
 *   resolves — upstream yields `{ type: undefined }` in those positions;
 * - named records are cached as their JSON Schema object rather than the
 *   internal props Map upstream stores, so later by-name references resolve
 *   to a real schema.
 */
import type { SchemaNodeData } from "../../types/schema";
import type { AvroSchema } from "./types";

const BYTES_PATTERN = "^[\u0000-\u00ff]*$";
const INT_MIN = Math.pow(-2, 31);
const INT_MAX = Math.pow(2, 31) - 1;
const LONG_MIN = Math.pow(-2, 63);
const LONG_MAX = Math.pow(2, 63) - 1;

type AvroLoose = Record<string, unknown>;
type RecordCache = Record<string, SchemaNodeData>;

const typeMappings: Record<string, string> = {
  null: "null",
  boolean: "boolean",
  int: "integer",
  long: "integer",
  float: "number",
  double: "number",
  bytes: "string",
  string: "string",
  fixed: "string",
  map: "object",
  array: "array",
  enum: "string",
  record: "object",
  uuid: "string",
};

const asLoose = (value: unknown): AvroLoose =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as AvroLoose)
    : {};

function getFullyQualifiedName(avroDefinition: unknown): string | undefined {
  const loose = asLoose(avroDefinition);
  if (typeof loose.name !== "string") return undefined;
  return typeof loose.namespace === "string"
    ? `${loose.namespace}.${loose.name}`
    : loose.name;
}

function commonAttributesMapping(
  avroDefinition: AvroLoose,
  jsonSchema: SchemaNodeData,
  recordCache: RecordCache,
): void {
  if (avroDefinition.doc) jsonSchema.description = avroDefinition.doc as string;
  if (avroDefinition.default !== undefined) {
    jsonSchema.default = avroDefinition.default;
  }

  const fullyQualifiedName = getFullyQualifiedName(avroDefinition);
  if (fullyQualifiedName !== undefined && recordCache[fullyQualifiedName]) {
    jsonSchema["x-parser-schema-id"] = fullyQualifiedName;
  }
}

/**
 * Marks a field as required on the parent schema unless it is nullable
 * (a union containing "null") or carries a default value.
 */
function requiredAttributesMapping(
  fieldDefinition: AvroLoose,
  parentJsonSchema: SchemaNodeData,
  haveDefaultValue: boolean,
): void {
  const isUnionWithNull =
    Array.isArray(fieldDefinition.type) &&
    fieldDefinition.type.includes("null");

  if (!isUnionWithNull && !haveDefaultValue) {
    parentJsonSchema.required = parentJsonSchema.required || [];
    parentJsonSchema.required.push(fieldDefinition.name as string);
  }
}

function extractNonNullableTypeIfNeeded(
  typeInput: unknown,
  jsonSchemaInput: SchemaNodeData,
): { type: unknown; jsonSchema: SchemaNodeData } {
  let type = typeInput;
  let jsonSchema = jsonSchemaInput;
  // Map attributes to the first non-null type of a union.
  if (Array.isArray(typeInput) && typeInput.length > 0) {
    const pickSecondType = typeInput.length > 1 && typeInput[0] === "null";
    type = typeInput[+pickSecondType];
    if (jsonSchema.oneOf !== undefined) {
      jsonSchema = jsonSchema.oneOf[0];
    }
  }
  return { type, jsonSchema };
}

function exampleAttributeMapping(
  type: unknown,
  example: unknown,
  jsonSchema: SchemaNodeData,
): void {
  if (example === undefined || jsonSchema.examples || Array.isArray(type)) {
    return;
  }

  switch (type) {
    case "boolean":
      jsonSchema.examples = [example === "true"];
      break;
    case "int":
      jsonSchema.examples = [parseInt(example as string, 10)];
      break;
    default:
      jsonSchema.examples = [example];
  }
}

function additionalAttributesMapping(
  typeInput: unknown,
  avroDefinition: AvroLoose,
  jsonSchemaInput: SchemaNodeData,
): void {
  const { type, jsonSchema } = extractNonNullableTypeIfNeeded(
    typeInput,
    jsonSchemaInput,
  );

  exampleAttributeMapping(type, avroDefinition.example, jsonSchema);

  function setAdditionalAttribute(...names: string[]) {
    names.forEach((name) => {
      let isValueCoherent = true;
      if (name === "minLength" || name === "maxLength") {
        isValueCoherent = (avroDefinition[name] as number) > -1;
      } else if (name === "multipleOf") {
        isValueCoherent = (avroDefinition[name] as number) > 0;
      }
      if (avroDefinition[name] !== undefined && isValueCoherent) {
        jsonSchema[name] = avroDefinition[name];
      }
    });
  }

  switch (type) {
    case "int": // int, long, float, and double must support the attributes below
    case "long":
    case "float":
    case "double":
      setAdditionalAttribute(
        "minimum",
        "maximum",
        "exclusiveMinimum",
        "exclusiveMaximum",
        "multipleOf",
      );
      break;
    case "string":
      if (avroDefinition.logicalType) {
        jsonSchema.format = avroDefinition.logicalType as string;
      }
      setAdditionalAttribute("pattern", "minLength", "maxLength");
      break;
    case "array":
      setAdditionalAttribute("minItems", "maxItems", "uniqueItems");
      break;
    default:
      break;
  }
}

/** Caches the schema under the record's fully qualified name, when it has one. */
function cacheAvroRecordDef(
  cache: RecordCache,
  key: string | undefined,
  value: SchemaNodeData,
): void {
  if (key !== undefined) {
    cache[key] = value;
  }
}

function convertAvroToJsonSchema(
  avroDefinition: AvroSchema,
  recordCache: RecordCache,
): SchemaNodeData {
  let jsonSchema: SchemaNodeData = {};

  if (Array.isArray(avroDefinition)) {
    return processUnionSchema(jsonSchema, avroDefinition, recordCache);
  }

  // An Avro definition can be a string (e.g. "int" or a named-type reference)
  // or an object like { type: "int" }.
  const loose = asLoose(avroDefinition);
  const type =
    typeof avroDefinition === "string" ? avroDefinition : loose.type;
  jsonSchema.type = typeMappings[type as string];

  switch (type) {
    case "int": {
      jsonSchema.minimum = INT_MIN;
      jsonSchema.maximum = INT_MAX;
      break;
    }
    case "long": {
      jsonSchema.minimum = LONG_MIN;
      jsonSchema.maximum = LONG_MAX;
      break;
    }
    case "bytes": {
      jsonSchema.pattern = BYTES_PATTERN;
      break;
    }
    case "fixed": {
      jsonSchema.pattern = BYTES_PATTERN;
      jsonSchema.minLength = loose.size;
      jsonSchema.maxLength = loose.size;
      break;
    }
    case "map": {
      jsonSchema.additionalProperties = convertAvroToJsonSchema(
        loose.values as AvroSchema,
        recordCache,
      );
      break;
    }
    case "array": {
      jsonSchema.items = convertAvroToJsonSchema(
        loose.items as AvroSchema,
        recordCache,
      );
      break;
    }
    case "enum": {
      jsonSchema.enum = loose.symbols as unknown[];
      break;
    }
    case "float": // float and double carry their Avro type as JSON Schema format
    case "double": {
      jsonSchema.format = type;
      break;
    }
    case "record": {
      // The cache is filled only after the fields are processed (upstream
      // ordering): a self-referencing field therefore misses the cache and
      // renders as an untyped leaf instead of creating a circular object.
      const propsMap = processRecordSchema(loose, recordCache, jsonSchema);
      cacheAvroRecordDef(
        recordCache,
        getFullyQualifiedName(avroDefinition),
        jsonSchema,
      );
      jsonSchema.properties = Object.fromEntries(propsMap.entries());
      break;
    }
    default: {
      // Named-type reference: either an object with name/namespace or a bare
      // string like "com.example.Address" (the string lookup is a divergence
      // from upstream, which resolves only object-shaped references).
      const cachedRecord =
        recordCache[getFullyQualifiedName(avroDefinition) as string] ??
        (typeof type === "string" ? recordCache[type] : undefined);
      if (cachedRecord) {
        jsonSchema = cachedRecord;
      }
      break;
    }
  }

  commonAttributesMapping(loose, jsonSchema, recordCache);
  additionalAttributesMapping(type, loose, jsonSchema);

  return jsonSchema;
}

/**
 * Converts the fields of a record into a name → JSON Schema map, deriving
 * the parent's required list and caching named sub-records along the way.
 */
function processRecordSchema(
  avroDefinition: AvroLoose,
  recordCache: RecordCache,
  jsonSchema: SchemaNodeData,
): Map<string, SchemaNodeData> {
  const propsMap = new Map<string, SchemaNodeData>();
  for (const field of (avroDefinition.fields ?? []) as AvroLoose[]) {
    // A sibling field may reference a previously processed named type.
    const cachedByName =
      typeof field.type === "string" ? recordCache[field.type] : undefined;
    if (cachedByName) {
      propsMap.set(field.name as string, cachedByName);

      const cached: AvroLoose = { name: field.name, ...cachedByName };
      requiredAttributesMapping(cached, jsonSchema, cached.default !== undefined);
    } else {
      const def = convertAvroToJsonSchema(field.type as AvroSchema, recordCache);

      requiredAttributesMapping(field, jsonSchema, field.default !== undefined);
      commonAttributesMapping(field, def, recordCache);
      additionalAttributesMapping(field.type, field, def);

      propsMap.set(field.name as string, def);
      // If the field type is a named definition, cache it under its name.
      cacheAvroRecordDef(recordCache, getFullyQualifiedName(field.type), def);
    }
  }
  return propsMap;
}

/**
 * Converts a union into oneOf. The "null" alternative is pushed last so
 * generated examples prefer the non-null types.
 */
function processUnionSchema(
  jsonSchema: SchemaNodeData,
  avroDefinition: AvroSchema[],
  recordCache: RecordCache,
): SchemaNodeData {
  const oneOf: SchemaNodeData[] = [];
  let nullDef: SchemaNodeData | null = null;

  for (const avroDef of avroDefinition) {
    const def = convertAvroToJsonSchema(avroDef, recordCache);
    // avroDef can be { type: "int", default: 1 }, so its type takes priority.
    const defType = typeof avroDef === "string" ? avroDef : asLoose(avroDef).type;
    if (defType === "null") {
      nullDef = def;
    } else {
      oneOf.push(def);
      cacheAvroRecordDef(recordCache, getFullyQualifiedName(avroDef), def);
    }
  }
  if (nullDef) oneOf.push(nullDef);
  jsonSchema.oneOf = oneOf;

  return jsonSchema;
}

/** Converts an Avro schema into a JSON-Schema-shaped object for rendering. */
export function avroToJsonSchema(avroDefinition: AvroSchema): SchemaNodeData {
  return convertAvroToJsonSchema(avroDefinition, {});
}
