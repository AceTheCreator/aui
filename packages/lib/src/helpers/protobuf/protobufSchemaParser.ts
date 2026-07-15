/**
 * The lib's browser-safe Protobuf schema parser plugin for @asyncapi/parser. It
 * replaces the optional @asyncapi/protobuf-schema-parser (which declares
 * @asyncapi/parser as a hard runtime dependency and doesn't export its bare
 * converter), so protobuf documents parse identically in the browser and in
 * Node. Mirrors the upstream package's factory shape:
 *
 *   registerProtobufSchemaParser(parser);
 *
 * All @asyncapi/parser imports are type-only, so this module adds no runtime
 * dependency on the parser. It is deliberately not re-exported from the
 * protobuf barrel: the barrel is the pure converter API used by
 * schemaFormat.ts, and routing this module through it would create an import
 * cycle (schemaFormat → protobuf barrel → this file → schemaFormat).
 *
 * Unlike the Avro plugin there is no kafka message-key conversion here —
 * upstream @asyncapi/protobuf-schema-parser has none either (an Avro-parser
 * specialty).
 */
import type {
  AsyncAPISchema,
  ParseSchemaInput,
  SchemaParser,
  ValidateSchemaInput,
} from "@asyncapi/parser";
import { protoToJsonSchema } from "./protoToJsonSchema";
import { validateProtobufStructure } from "./validateProtobufStructure";
import { isProtobufSchemaFormat, X_LIB_CONVERSION_ERROR } from "../schemaFormat";
import {
  registerSchemaParserWithFallback,
  type SchemaParserHost,
} from "../schemaParserRegistry";

// MIME strings registered on the parser Map: the two exact strings upstream
// @asyncapi/protobuf-schema-parser registers, plus the version-less variant.
// registerProtobufSchemaParser also installs a registry fallback for any
// version matching isProtobufSchemaFormat.
const PROTOBUF_MIME_TYPES = [
  "application/vnd.google.protobuf",
  "application/vnd.google.protobuf;version=2",
  "application/vnd.google.protobuf;version=3",
];

// A function that returns a SchemaParser object
// Just like how @asyncapi/protobuf-schema-parser does it.
export function ProtobufSchemaParser(): SchemaParser {
  return {
    validate,
    parse,
    getMimeTypes: () => PROTOBUF_MIME_TYPES,
  };
}

/**
 * Registers the Protobuf schema parser and makes parser-js accept any
 * protobuf schemaFormat version (not only the exact strings in
 * PROTOBUF_MIME_TYPES).
 */
export function registerProtobufSchemaParser(parser: SchemaParserHost): void {
  registerSchemaParserWithFallback(
    parser,
    ProtobufSchemaParser(),
    isProtobufSchemaFormat,
  );
}

function validate(input: ValidateSchemaInput<unknown, unknown>) {
  return validateProtobufStructure(input.data).map((message) => ({
    message,
    path: input.path,
  }));
}

function parse(input: ParseSchemaInput<unknown, unknown>): AsyncAPISchema {
  if (typeof input.data !== "string") {
    return {
      [X_LIB_CONVERSION_ERROR]:
        "Protobuf schema must be a string of .proto source",
    };
  }

  try {
    // The cast is safe: the converted schema is a plain JSON Schema object;
    // SchemaNodeData just types `type` more loosely than the spec union.
    return protoToJsonSchema(input.data) as AsyncAPISchema;
  } catch (err) {
    // Never throw: parseDocument treats a parse() throw as fatal and drops
    // the whole document. Return a marker so rendering fails soft for this
    // schema only (resolveSchemaInput picks it up).
    return {
      [X_LIB_CONVERSION_ERROR]:
        err instanceof Error ? err.message : "Failed to convert Protobuf schema",
    };
  }
}
