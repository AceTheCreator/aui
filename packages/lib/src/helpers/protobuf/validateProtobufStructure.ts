/**
 * Structural validation for protobuf schema inputs, mirroring
 * validateAvroStructure's shape. Protobuf is a compiled language, so unlike
 * Avro there is no cheap structural walk: the only meaningful check is
 * whether the source compiles — the same approach the upstream
 * @asyncapi/protobuf-schema-parser validate() takes.
 */
import { protoToJsonSchema } from "./protoToJsonSchema";

/**
 * Returns human-readable problems with a protobuf schema definition, or an
 * empty array when the source compiles. Never throws.
 */
export function validateProtobufStructure(definition: unknown): string[] {
  if (typeof definition !== "string") {
    return ["Protobuf schema must be a string of .proto source"];
  }

  try {
    protoToJsonSchema(definition);
    return [];
  } catch (err) {
    return [
      err instanceof Error ? err.message : "Failed to parse protobuf schema",
    ];
  }
}
