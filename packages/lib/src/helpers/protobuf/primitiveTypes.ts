/**
 * Protobuf scalar type → JSON Schema mapping. Each entry keeps the original
 * proto type name under `x-primitive`. The `WITH_LIMITS` variant carries the
 * numeric value ranges of the wire types; `MINIMAL` (selected via the
 * `@Option primitiveTypesWithLimits false` annotation) drops them.
 *
 * Ported from @asyncapi/protobuf-schema-parser
 * (https://github.com/asyncapi/protobuf-schema-parser), Copyright the
 * AsyncAPI Initiative, licensed under Apache-2.0 — see THIRD_PARTY_NOTICES.md.
 * Divergence from upstream: typed against the lib's SchemaNodeData instead of
 * @asyncapi/parser's AsyncAPISchemaDefinition.
 */
import type { SchemaNodeData } from "../../types/schema";

export interface ProtoTypeMap {
  [key: string]: SchemaNodeData;
}

export class PrimitiveTypes {
  private static readonly MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  private static readonly MIN_SAFE_INTEGER = -this.MAX_SAFE_INTEGER;

  public static readonly PRIMITIVE_TYPES_WITH_LIMITS: ProtoTypeMap = {
    bytes: {
      type: "string",
      format: "bytes",
      "x-primitive": "bytes",
    },
    string: {
      type: "string",
      "x-primitive": "string",
    },
    bool: {
      type: "boolean",
      "x-primitive": "bool",
    },
    int32: {
      type: "integer",
      format: "int32",
      minimum: -0x80000000,
      maximum: 0x7fffffff,
      "x-primitive": "int32",
    },
    sint32: {
      type: "integer",
      format: "sint32",
      minimum: -0x80000000,
      maximum: 0x7fffffff,
      "x-primitive": "sint32",
    },
    uint32: {
      type: "integer",
      format: "uint32",
      minimum: 0,
      maximum: 0xffffffff,
      "x-primitive": "uint32",
    },
    int64: {
      type: "integer",
      format: "int64",
      minimum: this.MIN_SAFE_INTEGER,
      maximum: this.MAX_SAFE_INTEGER,
      "x-primitive": "int64",
    },
    sint64: {
      type: "integer",
      format: "sint64",
      minimum: this.MIN_SAFE_INTEGER,
      maximum: this.MAX_SAFE_INTEGER,
      "x-primitive": "sint64",
    },
    uint64: {
      type: "integer",
      format: "uint64",
      minimum: 0,
      maximum: this.MAX_SAFE_INTEGER,
      "x-primitive": "uint64",
    },
    fixed32: {
      type: "number",
      format: "fixed32",
      "x-primitive": "fixed32",
    },
    fixed64: {
      type: "number",
      format: "fixed64",
      "x-primitive": "fixed64",
    },
    sfixed32: {
      type: "number",
      format: "sfixed32",
      "x-primitive": "sfixed32",
    },
    sfixed64: {
      type: "number",
      format: "sfixed64",
      "x-primitive": "sfixed64",
    },
    float: {
      type: "number",
      format: "float",
      "x-primitive": "float",
    },
    double: {
      type: "number",
      format: "double",
      "x-primitive": "double",
    },
  };

  /**
   * Same as PRIMITIVE_TYPES_WITH_LIMITS but without the numeric
   * `minimum`/`maximum` range limits. Derived from the map above to avoid
   * duplicating every entry.
   */
  public static readonly PRIMITIVE_TYPES_MINIMAL: ProtoTypeMap =
    PrimitiveTypes.withoutRangeLimits(PrimitiveTypes.PRIMITIVE_TYPES_WITH_LIMITS);

  private static withoutRangeLimits(types: ProtoTypeMap): ProtoTypeMap {
    const minimal: ProtoTypeMap = {};
    for (const name of Object.keys(types)) {
      const definition = { ...types[name] };
      delete definition.minimum;
      delete definition.maximum;
      minimal[name] = definition;
    }
    return minimal;
  }
}
