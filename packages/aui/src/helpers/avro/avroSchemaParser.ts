/**
 * aui's browser-safe Avro schema parser plugin for @asyncapi/parser. It
 * replaces the optional @asyncapi/avro-schema-parser (whose avsc dependency
 * needs Node's Buffer), so Avro documents parse identically in the browser
 * and in Node. Mirrors the upstream package's factory shape:
 *
 *   parser.registerSchemaParser(AvroSchemaParser());
 *
 * All @asyncapi/parser imports are type-only, so this module adds no runtime
 * dependency on the parser. It is deliberately not re-exported from the avro
 * barrel: the barrel is the pure converter API used by schemaFormat.ts, and
 * routing this module through it would create an import cycle
 * (schemaFormat → avro barrel → this file → schemaFormat).
 */
import type {
  AsyncAPISchema,
  ParseSchemaInput,
  SchemaParser,
  ValidateSchemaInput,
} from "@asyncapi/parser";
import { avroToJsonSchema } from "./avroToJsonSchema";
import { validateAvroStructure } from "./validateAvroStructure";
import type { AvroSchema } from "./types";
import { X_AUI_CONVERSION_ERROR } from "../schemaFormat";

// The MIME strings @asyncapi/avro-schema-parser registers, plus version-less
// variants (parser-js matches schemaFormat by exact string).
const AVRO_MIME_TYPES = [
  "application/vnd.apache.avro",
  "application/vnd.apache.avro+json",
  "application/vnd.apache.avro+yaml",
  "application/vnd.apache.avro;version=1.9.0",
  "application/vnd.apache.avro+json;version=1.9.0",
  "application/vnd.apache.avro+yaml;version=1.9.0",
  "application/vnd.apache.avro;version=1.8.2",
  "application/vnd.apache.avro+json;version=1.8.2",
  "application/vnd.apache.avro+yaml;version=1.8.2",
];

interface KafkaKeyBearer {
  "x-parser-original-bindings-kafka-key"?: unknown;
  bindings?: { kafka?: { key?: unknown } };
}

// A function that returns a SchemaParser object
// Just like how @asyncapi/avro-schema-parser does it.
export function AvroSchemaParser(): SchemaParser {
  return {
    validate,
    parse,
    getMimeTypes: () => AVRO_MIME_TYPES,
  };
}

function validate(input: ValidateSchemaInput<unknown, unknown>) {
  return validateAvroStructure(input.data).map((message) => ({
    message,
    path: input.path,
  }));
}

function parse(input: ParseSchemaInput<unknown, unknown>): AsyncAPISchema {
  try {
    // The cast is safe: the converted schema is a plain JSON Schema object;
    // SchemaNodeData just types `type` more loosely than the spec union.
    const converted = avroToJsonSchema(input.data as AvroSchema) as AsyncAPISchema;

    // Parity with @asyncapi/avro-schema-parser: the kafka message key can
    // also be an Avro schema.
    const message = (input.meta as { message?: KafkaKeyBearer }).message;
    const key = message?.bindings?.kafka?.key;
    if (key && message) {
      message["x-parser-original-bindings-kafka-key"] = key;
      message.bindings!.kafka!.key = avroToJsonSchema(key as AvroSchema);
    }

    return converted;
  } catch (err) {
    // Never throw: parseDocument treats a parse() throw as fatal and drops
    // the whole document. Return a marker so rendering fails soft for this
    // schema only (resolveSchemaInput picks it up).
    return {
      [X_AUI_CONVERSION_ERROR]:
        err instanceof Error ? err.message : "Failed to convert Avro schema",
    };
  }
}
